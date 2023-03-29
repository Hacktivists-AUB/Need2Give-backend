import { Generated } from 'kysely';
import { AccountSchema } from '../schemas/account';
import { DonationCenterSchema, UserSchema } from '../schemas';

type Table<Item, PrimaryKey extends keyof Item> = {
  [K in keyof Item]: K extends PrimaryKey ? Generated<Item[K]> : Item[K];
};

type AccountTable = Table<AccountSchema, 'id'>;
type UserTable = Table<UserSchema, 'id'>;
type DonationCenterTable = Table<DonationCenterSchema, 'id'>;

export {
  Table,
  AccountTable,
  UserTable,
  DonationCenterTable,
};
