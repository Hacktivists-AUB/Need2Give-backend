import z from 'zod';
import idSchema from './id';

const accountSchema = z.object({
  id: idSchema,
  email: z.string().email().trim().min(1).max(320),
  phone_number: z.string().trim().min(1).max(32).nullable(),
  username: z.string().trim().min(6).max(64).regex(/^[a-z0-9-.]*$/i),
  password: z.string().max(128),
  created_at: z.coerce.date(),
}).strict();
type AccountSchema = z.infer<typeof accountSchema>;

const pendingAccountSchema = accountSchema.extend({
  validation_key: z.coerce.number(),
});
type PendingAccountSchema = z.infer<typeof pendingAccountSchema>;

export {
  AccountSchema,
  accountSchema,
  PendingAccountSchema,
  pendingAccountSchema,
};
