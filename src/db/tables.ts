import { Generated } from 'kysely';
import {
  UserSchema,
  AccountSchema,
  ItemSchema,
  DonationCenterSchema,
  PendingDonationCenterSchema,
  ItemCategorySchema,
  FollowSchema,
} from '../schemas';
import { PendingAccountSchema } from '../schemas/account';

type Table<Item, GeneratedColumns extends keyof Item> = {
  [K in keyof Item]: K extends GeneratedColumns ? Generated<Item[K]> : Item[K];
};

type AccountTable = Table<AccountSchema, 'id' | 'created_at'>;
type PendingAccountTable = Table<PendingAccountSchema, 'id' | 'created_at' | 'validation_key'>;
type UserTable = Table<UserSchema, 'id'>;
type PendingUserTable = Table<UserSchema, 'id'>;
type DonationCenterTable = Table<DonationCenterSchema, 'id'>;
type PendingDonationCenterTable = Table<PendingDonationCenterSchema, 'id' | 'admin_validated' | 'email_validated' | 'admin_key'>;
type ItemTable = Table<ItemSchema, 'id' | 'created_at'>;
type ItemCategoryTable = Table<ItemCategorySchema, 'id'>;
type FollowTable = Table<FollowSchema, 'id'>;

export {
  Table,
  AccountTable,
  PendingAccountTable,
  UserTable,
  PendingUserTable,
  DonationCenterTable,
  PendingDonationCenterTable,
  ItemTable,
  ItemCategoryTable,
  FollowTable,
};
