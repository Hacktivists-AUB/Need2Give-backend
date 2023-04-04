import { Insertable } from 'kysely';
import {
  AccountTable,
  DonationCenterTable,
  ItemTable,
  UserTable,
} from '../tables';
import { ItemCategories } from '../../schemas/itemCategory';

const accounts: Insertable<AccountTable>[] = [{
  id: 1,
  email: 'dummy@blobmail.org',
  username: 'lemon boy',
  phone_number: '03 123 123',
  password: 'His hair\'s a mess',
}, {
  id: 2,
  email: 'dummy2@blobmail.org',
  username: 'juno',
  phone_number: '07 987 987',
  password: 'She\'s gonna live forever',
}, {
  id: 3,
  email: 'dummy3@blobmail.org',
  username: 'Paul',
  phone_number: '01 159 159',
  password: 'I don\'t know who I am yet :)',
}, {
  id: 4,
  email: 'dummy4@blobmail.org',
  username: 'little_guy',
  phone_number: '01 235 678',
  password: 'I was eight years old with a furry animal',
}];

const users: Insertable<UserTable>[] = [{
  id: 1,
  account_id: 2,
  full_name: 'blob',
  birth_date: new Date(),
}, {
  id: 2,
  account_id: 4,
  full_name: 'blobby',
  birth_date: new Date('1998-12-15'),
}];

const donationCenters: Insertable<DonationCenterTable>[] = [{
  id: 1,
  account_id: 1,
  latitude: 1.4321,
  longitude: -1.0006509,
  name: 'Sweet tooth pharmacy 1',
  description: 'one',
  opening_time: '2:30:23 AM',
  closing_time: '11:30 PM',
  opening_days: { monday: true, tuesday: true, friday: true },
}, {
  id: 2,
  account_id: 3,
  latitude: 3.4321,
  longitude: -3.0006509,
  name: 'Sweet tooth pharmacy 3',
  description: 'three',
  opening_time: '11:30 AM',
  closing_time: '11:30 PM',
  opening_days: {},
}];

const items: Insertable<ItemTable>[] = [{
  name: 'gloves',
  category: ItemCategories.clothes,
  quantity: 2,
  donor_id: null,
  donation_center_id: 1,
  description: 'very nice item',
}, {
  name: 'cleaning product',
  category: ItemCategories.other,
  quantity: 1,
  donor_id: 2,
  donation_center_id: 2,
  description: null,
}];

export {
  accounts,
  users,
  donationCenters,
  items,
};
