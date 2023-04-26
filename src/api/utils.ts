import { DatabaseError } from 'pg';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import config from '../config';
import {
  AccountSchema,
  accountSchema,
  donationCenterSchema,
  userSchema,
} from '../schemas';
import db from '../db';

const saltRounds = 12;

function generateJWT(accountID: AccountSchema['id'], role: 'user' | 'donation_center') {
  return jwt.sign(
    { id: accountID, role },
    config.JWT_SECRET_KEY,
    { expiresIn: config.JWT_EXPIRY_DURATION },
  );
}

function getDuplicateProperty(error: DatabaseError) {
  if (!error.detail) return null;
  const matches = /Key \(([\w]+)\)=\((.+)\) already exists\./.exec(error.detail);
  return (matches === null) ? null : matches[1];
}

function addPrefix<T extends string, K extends string>(prefix: T, keys: K[]) {
  return keys.map((s) => `${prefix}.${s}`) as `${T}.${K}`[];
}

const accountKeysWithoutPassword = addPrefix(
  'account',
  accountSchema.keyof().options
    .filter((key) => key !== 'password' as keyof Omit<AccountSchema, 'password'>),
);

function getUserQuery(id?: number) {
  return db.selectFrom('user')
    .select(addPrefix('user', userSchema.keyof().options))
    .$if(!!id, (qb) => qb.where('user.id', '=', id!))
    .innerJoin('account', 'user.id', 'account.id')
    .select(accountKeysWithoutPassword);
}

function getDonationCenterQuery(id?: number) {
  return db.selectFrom('donation_center')
    .select(addPrefix('donation_center', donationCenterSchema.keyof().options))
    .$if(!!id, (qb) => qb.where('donation_center.id', '=', id!))
    .innerJoin('account', 'donation_center.id', 'account.id')
    .select(accountKeysWithoutPassword);
}

function toHtmlTable(inserted: Object) {
  const rows = Object.entries(inserted)
    .map((([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`))
    .join('');
  return `<table style="border: 1px solid black;">${rows}</table>`;
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

export {
  saltRounds,
  generateJWT,
  getDuplicateProperty,
  accountKeysWithoutPassword,
  getUserQuery,
  getDonationCenterQuery,
  toHtmlTable,
  transporter,
  addPrefix,
};
