import { sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import z from 'zod';
import db from '../../db';
import { itemSchema } from '../../schemas';

const itemSearchSchema = z.object({
  name: z.string().trim(),
  min_quantity: itemSchema.shape.quantity,
  max_quantity: itemSchema.shape.quantity,
  limit: z.coerce.number().positive(),
  offset: z.coerce.number().nonnegative(),
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

function getQueryFromSearchSettings(settings: z.infer<typeof itemSearchSchema>) {
  let query = db.selectFrom('item').selectAll()
    .select((eb) => [
      jsonObjectFrom(
        eb.selectFrom('donation_center')
          .selectAll()
          .whereRef('donation_center.id', '=', 'item.donation_center_id'),
      ).as('donation_center'),
    ]);

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
  return query.orderBy('item.created_at', 'asc');
}

const insertableItemSchema = itemSchema.omit({ id: true, created_at: true });

export { getQueryFromSearchSettings, itemSearchSchema, insertableItemSchema };
