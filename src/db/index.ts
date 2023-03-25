import { Pool } from 'pg';
import { Generated, Kysely, PostgresDialect } from 'kysely';

import config from '../config';
import { AccountSchema } from '../schemas/account';

type Table<Item, PrimaryKey extends keyof Item> = {
  [K in keyof Item]: K extends PrimaryKey ? Generated<Item[K]> : Item[K];
};

interface Database {
  account: Table<AccountSchema, 'id'>;
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
