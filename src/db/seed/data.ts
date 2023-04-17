import { Insertable } from 'kysely';
import bcrypt from 'bcrypt';

import {
  AccountTable,
  PendingAccountTable,
  DonationCenterTable,
  PendingDonationCenterTable,
  ItemTable,
  UserTable,
} from '../tables';
import { ItemCategories } from '../../schemas/itemCategory';
import { saltRounds } from '../../api/utils';

async function get() {
  const accounts: Insertable<AccountTable>[] = await Promise.all([{
    email: 'dummy@blobmail.org',
    username: 'lemon boy',
    phone_number: '03 123 123',
    password: 'His hair\'s a mess',
  }, {
    email: 'dummy2@blobmail.org',
    username: 'juno',
    phone_number: '07 987 987',
    password: 'She\'s gonna live forever',
  }, {
    email: 'dummy3@blobmail.org',
    username: 'Paul',
    phone_number: '01 159 159',
    password: 'I don\'t know who I am yet :)',
  }, {
    email: 'dummy4@blobmail.org',
    username: 'little_guy',
    phone_number: '01 235 678',
    password: 'I was eight years old with a furry animal',
  }, {
    email: 'dummy5@blobmail.org',
    username: 'pizza lover',
    phone_number: '04 567 890',
    password: 'I could eat pizza every day',
  }, {
    email: 'dummy6@blobmail.org',
    username: 'spiderman',
    phone_number: '02 345 678',
    password: 'With great power comes great responsibility',
  }, {
    email: 'dummy7@blobmail.org',
    username: 'snoopy',
    phone_number: '09 876 543',
    password: 'Curse you, Red Baron!',
  }, {
    email: 'dummy8@blobmail.org',
    username: 'donutlover',
    phone_number: '06 789 012',
    password: 'Life is short, eat the donut',
  }, {
    email: 'dummy9@blobmail.org',
    username: 'thor',
    phone_number: '02 345 123',
    password: 'I am the god of thunder',
  }, {
    email: 'dummy10@blobmail.org',
    username: 'spongebob',
    phone_number: '01 234 567',
    password: 'I\'m ready, I\'m ready',
  }].map(async (account) => ({
    ...account,
    password: await bcrypt.hash('I\'m ready, I\'m ready', saltRounds),
  })));

  const pendingAccounts: Insertable<PendingAccountTable>[] = [
    {
      email: 'pending1@blobmail.org',
      username: 'pending_donation_center1',
      phone_number: '01 123 456',
      password: await bcrypt.hash('Pending#1Password', saltRounds),
    },
    {
      email: 'pending2@blobmail.org',
      username: 'pending_donation_center2',
      phone_number: '01 789 012',
      password: await bcrypt.hash('Pending#2Password', saltRounds),
    },
  ];

  const users: Insertable<UserTable>[] = [{
    full_name: 'blob',
    birth_date: new Date(),
  }, {
    full_name: 'blobby',
    birth_date: new Date('1998-12-15'),
  }, {
    full_name: 'jane doe',
    birth_date: new Date('1990-05-20'),
  }, {
    full_name: 'brandon flowers',
    birth_date: new Date('1981-06-21'),
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
    name: 'Sweet tooth pharmacy 2',
    description: 'two',
    opening_time: '11:30 AM',
    closing_time: '11:30 PM',
    opening_days: { wednesday: true, thursday: true, saturday: true },
  }, {
    latitude: 4.4321,
    longitude: -4.0006509,
    name: 'Sweet tooth pharmacy 3',
    description: 'three',
    opening_time: '12:00 PM',
    closing_time: '11:00 PM',
    opening_days: { sunday: true },
  }, {
    latitude: -4.21111,
    longitude: 153.5467,
    name: 'The Giving Tree',
    description: 'Donate today. Help those in need',
    opening_time: '8:00:00 AM',
    closing_time: '5:00:00 PM',
    opening_days: {
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
    },
  }, {
    latitude: 2.12345,
    longitude: -2.98765,
    name: 'Helping Hands',
    description: 'By the people for the people',
    opening_time: '9:00 AM',
    closing_time: '5:00 PM',
    opening_days: {
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
    },
  }, {
    latitude: 37.7749,
    longitude: -122.4194,
    name: 'Rosa\'s charity',
    description: 'Community charity',
    opening_time: '10:00:00 AM',
    closing_time: '4:00:00 PM',
    opening_days: {
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
    },
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
  }, {
    name: 'blanket',
    category: ItemCategories.clothes,
    quantity: 3,
    description: 'warm and cozy',
  }, {
    name: 'flashlight',
    category: ItemCategories.other,
    quantity: 2,
    description: 'with extra batteries',
  }, {
    name: 'canned soup',
    category: ItemCategories.food,
    quantity: 4,
    description: 'tomato flavor',
  }, {
    name: 'aspirin boxes',
    category: ItemCategories.medication,
    quantity: 5,
    description: '10 pills per box',
  }, {
    name: 'notebook',
    category: ItemCategories.other,
    quantity: 3,
    description: 'with blank pages',
  }, {
    name: 'instant noodles',
    category: ItemCategories.food,
    quantity: 2,
    description: 'chicken flavor',
  }, {
    name: 'eye drops',
    category: ItemCategories.medication,
    quantity: 2,
    description: 'for dry eyes',
  }];

  return {
    accounts,
    pendingAccounts,
    users,
    donationCenters,
    pendingDonationCenters,
    items,
  };
}

export default { get };
