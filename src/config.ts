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
  SERVER_HOST: z.string(),
  NODE_ENV: z.enum(['production', 'development']).default('development'),
  JWT_SECRET_KEY: z.string(),
  JWT_EXPIRY_DURATION: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
  EMAIL_ADMIN: z.string(),
});

const config = configSchema.parse(process.env);

export default config;
