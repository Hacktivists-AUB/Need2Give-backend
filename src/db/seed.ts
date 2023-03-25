import db from './index';
import { AccountTable } from './tables';

const accounts: Omit<AccountTable, 'id'>[] = [{
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
}];

async function seed() {
  await db.insertInto('account').values(accounts).executeTakeFirst();
  db.destroy();
}

seed();
