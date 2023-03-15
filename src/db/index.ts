import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

import config from '../config';
import { AccountTable } from './AccountTable';

interface Database {
  account: AccountTable
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: config.POSTGRES_HOST,
      port: Number(config.POSTGRES_PORT),
      user: config.POSTGRES_USER,
      password: config.POSTGRES_PASSWORD,
      database: config.POSTGRES_DB,
    }),
  }),
});

export default db;
