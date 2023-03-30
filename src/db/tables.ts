import { Generated } from 'kysely';
import {
  UserSchema, AccountSchema, ItemSchema, DonationCenterSchema,
} from '../schemas';

type Table<Item, PrimaryKey extends keyof Item> = {
  [K in keyof Item]: K extends PrimaryKey ? Generated<Item[K]> : Item[K];
};

type AccountTable = Table<AccountSchema, 'id'>;
type UserTable = Table<UserSchema, 'id'>;
type DonationCenterTable = Table<DonationCenterSchema, 'id'>;
type ItemTable = Table<ItemSchema, 'id'>;

export {
  Table,
  AccountTable,
  UserTable,
  DonationCenterTable,
  ItemTable,
};
