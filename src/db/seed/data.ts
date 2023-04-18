import { Insertable } from 'kysely';
import bcrypt from 'bcrypt';

import {
  AccountTable,
  DonationCenterTable,
  PendingDonationCenterTable,
  ItemTable,
  UserTable,
} from '../tables';
import { ItemCategories } from '../../schemas/itemCategory';
import { saltRounds } from '../../api/utils';

async function get() {
  const accounts: Insertable<AccountTable>[] = [{
    email: 'dummy@blobmail.org',
    username: 'lemon boy',
    phone_number: '03 123 123',
    password: await bcrypt.hash('His hair\'s a mess', saltRounds),
  }, {
    email: 'dummy2@blobmail.org',
    username: 'juno',
    phone_number: '07 987 987',
    password: await bcrypt.hash('She\'s gonna live forever', saltRounds),
  }, {
    email: 'dummy3@blobmail.org',
    username: 'Paul',
    phone_number: '01 159 159',
    password: await bcrypt.hash('I don\'t know who I am yet :)', saltRounds),
  }, {
    email: 'dummy4@blobmail.org',
    username: 'little_guy',
    phone_number: '01 235 678',
    password: await bcrypt.hash('I was eight years old with a furry animal', saltRounds),
  }];

  const users: Insertable<UserTable>[] = [{
    full_name: 'blob',
    birth_date: new Date(),
  }, {
    full_name: 'blobby',
    birth_date: new Date('1998-12-15'),
  }];

  const donationCenters: Insertable<DonationCenterTable>[] = [{
    latitude: 1.4321,
    longitude: -1.0006509,
    name: 'Sweet tooth pharmacy 1',
    description: 'one',
    opening_time: '2:30:23 AM',
    closing_time: '11:30 PM',
    opening_days: { monday: true, tuesday: true, friday: true },
  }, {
    latitude: 3.4321,
    longitude: -3.0006509,
    name: 'Sweet tooth pharmacy 3',
    description: 'three',
    opening_time: '11:30 AM',
    closing_time: '11:30 PM',
    opening_days: {},
  }];

  const pendingDonationCenters: Insertable<PendingDonationCenterTable>[] = [{
    id: 1,
    name: 'Pending Center 1',
    description: 'This is a pending donation center.',
    latitude: 40.7128,
    longitude: -74.0060,
    opening_days: { monday: true, thursday: true, saturday: true },
    opening_time: '08:00:00',
    closing_time: '17:00:00',
  }, {
    id: 2,
    name: 'Pending Center 2',
    description: 'This is another pending donation center.',
    latitude: 12.17,
    longitude: -30.12,
    opening_days: { monday: true, wednesday: true, friday: true },
    opening_time: '08:00:00',
    closing_time: '17:00:00',
  }];

  const items: Insertable<Omit<ItemTable, 'donor_id' | 'donation_center_id'>>[] = [{
    name: 'gloves',
    category: ItemCategories.clothes,
    quantity: 2,
    description: 'very nice item',
  }, {
    name: 'cleaning product',
    category: ItemCategories.other,
    quantity: 1,
    description: null,
  }, {
    name: 'italian rice',
    category: ItemCategories.food,
    quantity: 1,
    description: 'blob',
  }, {
    name: 'panadol boxes',
    category: ItemCategories.medication,
    quantity: 7,
    description: '20 pills per box',
  }];

  return {
    accounts,
    users,
    donationCenters,
    pendingDonationCenters,
    items,
  };
}

export default { get };
