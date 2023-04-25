import { Generated } from 'kysely';
import {
  UserSchema,
  AccountSchema,
  ItemSchema,
  DonationCenterSchema,
} from '../schemas';
import { ItemCategorySchema } from '../schemas/itemCategory';

type Table<Item, GeneratedColumns extends keyof Item> = {
  [K in keyof Item]: K extends GeneratedColumns ? Generated<Item[K]> : Item[K];
};

type AccountTable = Table<AccountSchema, 'id' | 'created_at'>;
type PendingAccountTable = Table<AccountSchema, 'id' | 'created_at'>;
type UserTable = Table<UserSchema, 'id'>;
type DonationCenterTable = Table<DonationCenterSchema, 'id'>;
type PendingDonationCenterTable = Table<DonationCenterSchema, 'id'>;
type ItemTable = Table<ItemSchema, 'id' | 'created_at'>;
type ItemCategoryTable = Table<ItemCategorySchema, 'id'>;

export {
  Table,
  AccountTable,
  PendingAccountTable,
  UserTable,
  DonationCenterTable,
  PendingDonationCenterTable,
  ItemTable,
  ItemCategoryTable,
};
