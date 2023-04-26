import { sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import z from 'zod';
import db from '../../db';
import { donationCenterSchema, itemSchema } from '../../schemas';
import { accountKeysWithoutPassword, addPrefix } from '../utils';

const itemSearchSchema = z.object({
  name: z.string().trim(),
  min_quantity: itemSchema.shape.quantity,
  max_quantity: itemSchema.shape.quantity,
  limit: z.coerce.number().positive(),
  offset: z.coerce.number().nonnegative(),
  following: z.enum(['true', 'false']).transform((str) => str === 'true'),
  categories: z.preprocess(
    (str) => String(str).split(','),
    z.array(itemSchema.shape.category),
  ),
  ...itemSchema.pick({
    donor_id: true,
    donation_center_id: true,
  }).shape,
}).partial()
  .refine((obj) => (obj.min_quantity ?? 0) <= (obj.max_quantity ?? Infinity));

function getQueryFromSearchSettings(settings: z.infer<typeof itemSearchSchema>, userId?: number) {
  let query = db.selectFrom('item')
    .select(addPrefix('item', itemSchema.keyof().options))
    .select(({ selectFrom }) => [
      jsonObjectFrom(
        selectFrom('donation_center')
          .select(addPrefix('donation_center', donationCenterSchema.keyof().options))
          .whereRef('donation_center.id', '=', 'item.donation_center_id')
          .innerJoin('account', 'donation_center.id', 'account.id')
          .select(accountKeysWithoutPassword)
          .$if(
            userId !== undefined,
            (qb) => qb.select(
              (eb) => eb.exists(
                eb.selectFrom('follow')
                  .whereRef('donation_center_id', '=', 'donation_center.id')
                  .where('follower_id', '=', userId!),
              ).as('following'),
            ),
          ),
      ).as('donation_center'),
    ]).$if(
      settings.following !== undefined,
      (qb) => qb.where(({ selectFrom, exists, not }) => {
        const isFollowingQuery = exists(
          selectFrom('follow')
            .where('follow.follower_id', '=', userId!)
            .whereRef('follow.donation_center_id', '=', 'item.donation_center_id'),
        );
        return (settings.following) ? isFollowingQuery : not(isFollowingQuery);
      }),
    );

  // I don't use chaining because the LSP says: Type instantiation is
  // excessively deep and possibly infinite
  if (settings.categories) {
    query = query.where('category', 'in', settings.categories);
  }
  if (settings.min_quantity) {
    query = query.where('quantity', '>=', settings.min_quantity);
  }
  if (settings.max_quantity) {
    query = query.where('quantity', '<=', settings.max_quantity);
  }
  if (settings.donor_id) {
    query = query.where('donor_id', '=', settings.donor_id);
  }
  if (settings.donation_center_id) {
    query = query.where('donation_center_id', '=', settings.donation_center_id);
  }
  if (settings.name) {
    query = query
      .where(sql`item.name <<<-> ${settings.name} < 0.8`)
      .orderBy(sql`item.name <<<-> ${settings.name}`, 'asc');
  }
  if (settings.limit) {
    query = query.limit(settings.limit);
  }
  if (settings.offset) {
    query = query.offset(settings.offset);
  }
  return query.orderBy('item.created_at', 'desc');
}

const insertableItemSchema = itemSchema.omit({ id: true, created_at: true });

export { getQueryFromSearchSettings, itemSearchSchema, insertableItemSchema };
