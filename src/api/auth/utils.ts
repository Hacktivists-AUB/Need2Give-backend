import { Transaction } from 'kysely';

import db, { Database } from '../../db';

async function deletePendingUser(trx: Transaction<Database>, id: number, key: number) {
  const user = await trx
    .deleteFrom('pending_user')
    .where('id', '=', Number(id))
    .returningAll()
    .executeTakeFirstOrThrow();

  const account = await trx
    .deleteFrom('pending_account')
    .where('id', '=', Number(id))
    .where('validation_key', '=', key)
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    account,
    user,
  };
}

async function deletePendingDonationCenter(trx: Transaction<Database>, id: number) {
  const donationCenter = await trx
    .deleteFrom('pending_donation_center')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();

  const account = await trx
    .deleteFrom('pending_account')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    account,
    donationCenter,
  };
}

async function movePendingUser(id: number, key: number) {
  return db.transaction().execute(async (trx) => {
    const {
      account: { id: filteredID, validation_key: validationKey, ...account },
      user: { id: filteredID2, ...user },
    } = await deletePendingUser(trx, id, key);

    const insertedAccount = await trx.insertInto('account')
      .values(account)
      .returningAll()
      .executeTakeFirstOrThrow();

    const insertedUser = await trx.insertInto('user')
      .values({
        ...user,
        id: insertedAccount.id,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      ...insertedAccount,
      ...insertedUser,
    };
  });
}

async function movePendingDonationCenter(id: number) {
  return db.transaction().execute(async (trx) => {
    const {
      account: { id: filteredID, validation_key: validationKey, ...account },
      donationCenter: {
        id: filteredID2,
        admin_validated: adminValidated,
        email_validated: emailValidated,
        admin_key: adminKey,
        ...donationCenter
      },
    } = await deletePendingDonationCenter(trx, id);

    const insertedAccount = await trx.insertInto('account')
      .values(account)
      .returningAll()
      .executeTakeFirstOrThrow();

    const insertedDonationCenter = await trx.insertInto('donation_center')
      .values({
        ...donationCenter,
        id: insertedAccount.id,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      ...insertedAccount,
      ...insertedDonationCenter,
    };
  });
}

export {
  deletePendingDonationCenter,
  deletePendingUser,
  movePendingDonationCenter,
  movePendingUser,
};
