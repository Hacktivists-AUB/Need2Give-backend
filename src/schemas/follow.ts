import z from 'zod';
import idSchema from './id';

const followSchema = z.object({
  id: idSchema,
  follower_id: idSchema,
  donation_center_id: idSchema,
}).strict();
type FollowSchema = z.infer<typeof followSchema>;

export { FollowSchema, followSchema };
