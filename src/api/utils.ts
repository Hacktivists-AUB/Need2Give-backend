import { DatabaseError } from 'pg';
import jwt from 'jsonwebtoken';
import config from '../config';
import {
  AccountSchema,
  accountSchema,
  donationCenterSchema,
  userSchema,
} from '../schemas';
import db from '../db';

const saltRounds = 12;

function generateJWT(accountID: AccountSchema['id']) {
  return jwt.sign(
    { id: accountID },
    config.JWT_SECRET_KEY,
    { expiresIn: config.JWT_EXPIRY_DURATION },
  );
}

function getDuplicateProperty(error: DatabaseError) {
  if (!error.detail) return null;
  console.log(error.detail);
  const matches = /Key \(([\w]+)\)=\((.+)\) already exists\./.exec(error.detail);
  return (matches === null) ? null : matches[1];
}

function addPrefix<T extends string, K extends string>(prefix: T, keys: K[]) {
  return keys.map((s) => `${prefix}.${s}`) as `${T}.${K}`[];
}

function getUserQuery(id?: number) {
  return db.selectFrom('account')
    .$if(!!id, (qb) => qb.where('account.id', '=', id!))
    .innerJoin('user', 'user.id', 'account.id')
    .select([
      ...addPrefix('account', accountSchema.keyof().options
        .filter((key) => key !== 'password') as (keyof Omit<AccountSchema, 'password'>)[]),
      ...addPrefix('user', userSchema.keyof().options),
    ]);
}

function getDonationCenterQuery(id?: number) {
  return db.selectFrom('account')
    .$if(!!id, (qb) => qb.where('account.id', '=', id!))
    .innerJoin('donation_center', 'donation_center.id', 'account.id')
    .select([
      ...addPrefix('account', accountSchema.keyof().options
        .filter((key) => key !== 'password') as (keyof Omit<AccountSchema, 'password'>)[]),
      ...addPrefix('donation_center', donationCenterSchema.keyof().options),
    ]);
}

export {
  saltRounds,
  generateJWT,
  getDuplicateProperty,
  getUserQuery,
  getDonationCenterQuery,
};
