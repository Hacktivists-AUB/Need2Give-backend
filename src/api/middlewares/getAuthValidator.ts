import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { NoResultError } from 'kysely';
import config from '../../config';
import { getDonationCenterQuery, getUserQuery } from '../utils';

function getAuthValidator(table: 'account' | 'user' | 'donation_center') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedJWT = jwt.verify(
        req.headers.authorization!,
        config.JWT_SECRET_KEY,
      ) as jwt.JwtPayload;

      if (decodedJWT.role !== 'user' && decodedJWT.role !== 'donation_center') {
        throw new Error('Unexpected JWT payload');
      }

      if (table !== 'account' && decodedJWT.role !== table) {
        throw new JsonWebTokenError('Unauthorized');
      }

      const query = (decodedJWT.role === 'user'
        ? getUserQuery
        : getDonationCenterQuery
      )(decodedJWT.id);

      res.locals.profile = await query.executeTakeFirstOrThrow();
      res.locals.role = decodedJWT.role;

      next();
    } catch (error) {
      if (error instanceof JsonWebTokenError
        || error instanceof TokenExpiredError
        || error instanceof NoResultError) {
        res.status(401);
      }
      next(error);
    }
  };
}

export default getAuthValidator;
