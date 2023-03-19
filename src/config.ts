import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const configSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  SERVER_PORT: z.coerce.number(),
  NODE_ENV: z.enum(['production', 'development']).optional(),
});

const config = configSchema.parse(process.env);

export default config;
