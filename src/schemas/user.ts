import z from 'zod';
import idSchema from './id';

const userSchema = z.object({
  id: idSchema,
  full_name: z.string().trim().nonempty().max(64),
  birth_date: z.coerce.date(),
}).strict();
type UserSchema = z.infer<typeof userSchema>;

export { UserSchema, userSchema };
