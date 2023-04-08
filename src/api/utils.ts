import { DatabaseError } from 'pg';
import jwt from 'jsonwebtoken';
import config from '../config';
import { AccountSchema } from '../schemas';

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

export { saltRounds, generateJWT, getDuplicateProperty };
