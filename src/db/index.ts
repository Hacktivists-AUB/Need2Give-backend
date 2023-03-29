import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

import config from '../config';
import { AccountTable, UserTable, DonationCenterTable } from './tables';

interface Database {
  account: AccountTable;
  user: UserTable;
  donation_center: DonationCenterTable;
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: config.POSTGRES_HOST,
      port: config.POSTGRES_PORT,
      user: config.POSTGRES_USER,
      password: config.POSTGRES_PASSWORD,
      database: config.POSTGRES_DB,
    }),
  }),
});

export default db;
