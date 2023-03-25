import jwt from 'jsonwebtoken';
import config from '../../config';
import { AccountSchema } from '../../schemas';

const saltRounds = 12;

function generateJWT(accountID: AccountSchema['id']) {
  return jwt.sign(
    { id: accountID },
    config.JWT_SECRET_KEY,
    { expiresIn: config.JWT_EXPIRY_DURATION },
  );
}

export { saltRounds, generateJWT };
