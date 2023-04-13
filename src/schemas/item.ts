import z from 'zod';
import idSchema from './id';
import { itemCategorySchema } from './itemCategory';

const itemSchema = z.object({
  id: idSchema,
  name: z.string().min(2).max(64),
  description: z.string().max(2048).nullable(),
  donor_id: idSchema.nullable(),
  donation_center_id: idSchema,
  quantity: z.coerce.number().nonnegative(),
  category: itemCategorySchema.shape.name,
  created_at: z.coerce.date(),
}).strict();
type ItemSchema = z.infer<typeof itemSchema>;

export { ItemSchema, itemSchema };
