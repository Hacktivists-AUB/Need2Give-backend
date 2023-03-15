import dotenv from 'dotenv';

dotenv.config();

interface Config {
  POSTGRES_HOST: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_PORT: string;
}

export default process.env as unknown as Config;
