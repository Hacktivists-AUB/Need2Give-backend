import { Insertable } from 'kysely';
import { AccountTable, DonationCenterTable, UserTable } from '../tables';

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
  account_id: 2,
  full_name: 'blob',
  birth_date: new Date(),
}, {
  account_id: 4,
  full_name: 'blobby',
  birth_date: new Date('1998-12-15'),
}];

const donationCenters: Insertable<DonationCenterTable>[] = [{
  account_id: 1,
  latitude: 1.4321,
  longitude: -1.0006509,
  name: 'Sweet tooth pharmacy 1',
  description: 'one',
  opening_time: '2:30:23 AM',
  closing_time: '11:30 PM',
  opening_days: { monday: true, tuesday: true, friday: true },
}, {
  account_id: 3,
  latitude: 3.4321,
  longitude: -3.0006509,
  name: 'Sweet tooth pharmacy 3',
  description: 'three',
  opening_time: '11:30 AM',
  closing_time: '11:30 PM',
  opening_days: {},
}];

export { accounts, users, donationCenters };
