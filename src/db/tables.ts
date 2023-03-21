/* eslint-disable newline-per-chained-call */
import { Generated } from 'kysely';
import { z } from 'zod';

const idSchema = z.coerce.number().int().positive();

const accountSchema = z.object({
  id: idSchema,
  email: z.string().email().trim().min(1).max(320),
  phone_number: z.string().trim().min(1).max(32).optional(),
  username: z.string().trim().min(6).max(64).regex(/^[a-z0-9-.]*$/i),
  password: z.string().max(128),
});
type AccountSchema = z.infer<typeof accountSchema>;

interface AccountTable {
  id: Generated<number>;
  email: string;
  phone_number: string;
  username: string;
  password: string;
}

// eslint-disable-next-line import/prefer-default-export
export {
  AccountTable,
  accountSchema,
  AccountSchema,
  idSchema,
};
