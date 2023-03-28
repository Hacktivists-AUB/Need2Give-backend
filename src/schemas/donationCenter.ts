import z from 'zod';
import idSchema from './id';

const dayOpeningStatus = z.boolean().default(false).optional();

const donationCenterSchema = z.object({
  id: idSchema,
  account_id: idSchema,
  name: z.string().trim().min(6).max(64),
  description: z.string().trim().max(2048).nullable(),
  opening_days: z.object({
    monday: dayOpeningStatus,
    tuesday: dayOpeningStatus,
    wednesday: dayOpeningStatus,
    thursday: dayOpeningStatus,
    friday: dayOpeningStatus,
    saturday: dayOpeningStatus,
    sunday: dayOpeningStatus,
  }).strict(),
  opening_time: z.string().trim(),
  closing_time: z.string().trim(),
  latitude: z.number(),
  longitude: z.number(),
}).strict();
type DonationCenterSchema = z.infer<typeof donationCenterSchema>;

export { DonationCenterSchema, donationCenterSchema };
