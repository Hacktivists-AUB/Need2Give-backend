import z from 'zod';
import idSchema from './id';

const itemSchema = z.object({
  id: idSchema,
  name: z.string(),
  description: z.string().nullable(),
  donor: z.string(),
  status: z.string(),
  quantity: z.number().nonnegative(),
  category: z.string(),
}).strict();
type ItemSchema = z.infer<typeof itemSchema>;

export { ItemSchema, itemSchema };
