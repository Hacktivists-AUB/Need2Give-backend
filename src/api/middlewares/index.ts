import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { NoResultError } from 'kysely';

import config from '../../config';
import { idSchema, itemSchema } from '../../schemas';
import { createValidator } from './requestValidator';
import db from '../../db';
import errorHandler from './errorHandler';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  next(new Error(`Not Found - ${req.path}`));
};

const IDValidator = createValidator({
  params: z.object({ id: idSchema }),
});

const itemValidator = createValidator({
  body: itemSchema.omit({ id: true }),
});

function getAuthValidator(table: 'account' | 'user' | 'donation_center') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedToken = jwt.verify(
        req.headers.authorization!,
        config.JWT_SECRET_KEY,
      ) as jwt.JwtPayload;

      const accountOrProfile = await db.selectFrom(table).selectAll()
        .where('id', '=', decodedToken.id)
        .executeTakeFirstOrThrow();
      res.locals[table] = accountOrProfile;
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

export {
  errorHandler,
  notFound,
  IDValidator,
  getAuthValidator,
  itemValidator,
};
