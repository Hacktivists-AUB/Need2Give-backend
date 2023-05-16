import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

import config from '../config';
import {
  AccountTable,
  PendingAccountTable,
  UserTable,
  DonationCenterTable,
  PendingDonationCenterTable,
  ItemTable,
  ItemCategoryTable,
  FollowTable,
  PendingUserTable,
} from './tables';

type Database = {
  account: AccountTable;
  pending_account: PendingAccountTable,
  user: UserTable;
  pending_user: PendingUserTable,
  donation_center: DonationCenterTable;
  pending_donation_center: PendingDonationCenterTable;
  item: ItemTable;
  item_category: ItemCategoryTable;
  follow: FollowTable;
};

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
export { Database };
