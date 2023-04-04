import db from '../index';
import {
  accounts,
  users,
  donationCenters,
  items,
} from './data';

async function deleteTableData() {
  await db.deleteFrom('account').execute();
  await db.deleteFrom('user').execute();
  await db.deleteFrom('donation_center').execute();
  await db.deleteFrom('item').execute();
}

async function logTableData() {
  console.table(await db.selectFrom('account').selectAll().execute());
  console.table(await db.selectFrom('user').selectAll().execute());
  console.table(await db.selectFrom('donation_center').selectAll().execute());
  console.table(await db.selectFrom('item').selectAll().execute());
  console.table(await db.selectFrom('item_category').selectAll().execute());
}

async function seed() {
  await deleteTableData();
  await db.transaction().execute(async (trx) => {
    await trx.insertInto('account').values(accounts).execute();
    await trx.insertInto('user').values(users).execute();
    await trx.insertInto('donation_center').values(donationCenters).execute();
    await trx.insertInto('item').values(items).execute();
  });
  console.log('Seeding ended successfully!');
  await logTableData();
  db.destroy();
}

seed();
