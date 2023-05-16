import db from '../index';
import data from './data';
import {
  cartesianProduct,
  deleteTableData,
  getRandom,
  getRandomSample,
  logTableData,
} from '../utils';

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

    const pendingAccounts = await trx.insertInto('pending_account')
      .values(seeds.pendingAccounts).returningAll().execute();

    await trx.insertInto('pending_user').values(
      seeds.pendingUsers.map((user, i) => ({
        ...user,
        id: pendingAccounts[i].id,
      })),
    ).returningAll().execute();

    await trx.insertInto('pending_donation_center').values(
      seeds.pendingDonationCenters.map((pendingDonationCenter, i) => ({
        ...pendingDonationCenter,
        id: pendingAccounts[i + seeds.pendingUsers.length].id,
      })),
    ).returningAll().execute();

    await trx.insertInto('item').values(
      seeds.items.map((item) => ({
        ...item,
        donor_id: getRandom([...users, null])?.id ?? null,
        donation_center_id: getRandom(donationCenters).id,
      })),
    ).execute();

    const follows = getRandomSample(cartesianProduct(users, donationCenters), 10)
      .map((follow) => ({
        follower_id: follow.first.id,
        donation_center_id: follow.second.id,
      }));

    await trx.insertInto('follow').values(follows).execute();
  });
  console.log('Seeding ended successfully!');
  await logTableData();
  await db.destroy();
}

seed();
