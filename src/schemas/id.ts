import z from 'zod';

const idSchema = z.coerce.number().int().positive();

export default idSchema;
