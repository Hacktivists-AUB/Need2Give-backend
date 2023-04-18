import db from '../index';
import data from './data';
import { deleteTableData, getRandom, logTableData } from '../utils';

async function seed() {
  await deleteTableData();

  const seeds = await data.get();

  await db.transaction().execute(async (trx) => {
    const accounts = await trx.insertInto('account')
      .values(seeds.accounts).returningAll().execute();

    const users = await trx.insertInto('user').values(
      seeds.users.map((user, i) => ({
        ...user,
        id: accounts[i].id,
      })),
    ).returningAll().execute();

    const donationCenters = await trx.insertInto('donation_center').values(
      seeds.donationCenters.map((donationCenter, i) => ({
        ...donationCenter,
        id: accounts[users.length + i].id,
      })),
    ).returningAll().execute();

    await trx.insertInto('pending_donation_center').values(
      seeds.pendingDonationCenters.map((pendingDonationCenter, i) => ({
        ...pendingDonationCenter,
        id: accounts[i].id,
      })),
    ).returningAll().execute();

    await trx.insertInto('item').values(
      seeds.items.map((item) => ({
        ...item,
        donor_id: getRandom([...users, null])?.id ?? null,
        donation_center_id: getRandom(donationCenters).id,
      })),
    ).execute();
  });
  console.log('Seeding ended successfully!');
  await logTableData();
  await db.destroy();
}

seed();
