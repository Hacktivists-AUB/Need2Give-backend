import z from 'zod';
import idSchema from './id';

const dayOpeningStatus = z.boolean().default(false);

const donationCenterSchema = z.object({
  id: idSchema,
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
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
}).strict();
type DonationCenterSchema = z.infer<typeof donationCenterSchema>;

const pendingDonationCenterSchema = donationCenterSchema.extend({
  admin_validated: z.coerce.boolean().default(false),
  email_validated: z.coerce.boolean().default(false),
});
type PendingDonationCenterSchema = z.infer<typeof pendingDonationCenterSchema>;

export {
  DonationCenterSchema,
  donationCenterSchema,
  PendingDonationCenterSchema,
  pendingDonationCenterSchema,
};
