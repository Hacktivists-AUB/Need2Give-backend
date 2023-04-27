import z from 'zod';
import { sql } from 'kysely';

import { donationCenterSchema, userSchema } from '../../schemas';
import { getDonationCenterQuery } from '../utils';

const donationCenterSearchSchema = z.object({
  name: z.string().trim(),
  limit: z.coerce.number().positive(),
  offset: z.coerce.number().nonnegative(),
  open: z.enum(['true', 'false']).transform((str) => str === 'true'),
  radius: z.coerce.number().nonnegative(),
  ...donationCenterSchema.pick({ latitude: true, longitude: true }).shape,
}).partial()
  .refine((obj) => (obj.latitude === undefined) === (obj.longitude === undefined));

function distanceExpression(latitude: number, longitude: number) {
  return sql<number>`point(longitude, latitude) <@> point(${longitude}, ${latitude})`;
}

function getCurrentDay() {
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return daysOfWeek[new Date().getDay()];
}

function getQueryFromSearchSettings(
  settings: z.infer<typeof donationCenterSearchSchema>,
  userId?: z.infer<typeof userSchema.shape.id>,
  donationCenterId?: z.infer<typeof donationCenterSchema.shape.id>,
) {
  let query = getDonationCenterQuery(donationCenterId)
    .select(({ and, cmpr }) => and([
      cmpr('donation_center.opening_time', '<=', 'now()'),
      cmpr('donation_center.closing_time', '>', 'now()'),
      sql`(opening_days->${getCurrentDay()})::boolean`,
    ]).as('open'));

  // I don't use chaining because the LSP says: Type instantiation is
  // excessively deep and possibly infinite
  if (settings.name) {
    query = query
      .where(sql`name <<<-> ${settings.name} < 0.8`)
      .orderBy(sql`name <<<-> ${settings.name}`, 'asc');
  }
  if (settings.latitude !== undefined && settings.longitude !== undefined) {
    query = query.select(
      distanceExpression(settings.latitude, settings.longitude).as('distance'),
    ).orderBy('distance');
    if (settings.radius) {
      query = query.where(
        distanceExpression(settings.latitude, settings.longitude),
        '<=',
        settings.radius,
      );
    }
  }
  if (settings.open !== undefined) {
    query = query.where(({ and, not, cmpr }) => {
      const isOpenExpression = and([
        cmpr('donation_center.opening_time', '<=', 'now()'),
        cmpr('donation_center.closing_time', '>', 'now()'),
        (settings.open)
          ? sql`opening_days->${getCurrentDay()} = ${settings.open}`
          : sql`not opening_days->${getCurrentDay()} = ${settings.open}`,
      ]);
      return (settings.open ? isOpenExpression : not(isOpenExpression));
    });
  }
  if (userId) {
    query = query.select(
      (eb) => eb.exists(
        eb.selectFrom('follow')
          .whereRef('donation_center_id', '=', 'donation_center.id')
          .where('follower_id', '=', userId),
      ).as('following'),
    );
  }
  if (settings.limit !== undefined) {
    query = query.limit(settings.limit);
  }
  if (settings.offset !== undefined) {
    query = query.offset(settings.offset);
  }
  return query;
}

export {
  distanceExpression,
  donationCenterSearchSchema,
  getQueryFromSearchSettings,
};
