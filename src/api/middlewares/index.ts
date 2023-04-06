import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { NoResultError } from 'kysely';

import config from '../../config';
import { accountSchema, idSchema, itemSchema } from '../../schemas';
import { createValidator } from './requestValidator';
import db from '../../db';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  next(new Error(`Not Found - ${req.path}`));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  if (res.statusCode >= 200 && res.statusCode < 300) {
    res.status(500);
  }
  res.json({
    name: error.name,
    message: error.message,
    stack: (config.NODE_ENV === 'production') ? '' : error.stack,
  });
};

const IDValidator = createValidator({
  params: z.object({ id: idSchema }),
});

const signupValidator = createValidator({
  body: accountSchema.omit({ id: true }),
});

const loginValidator = createValidator({
  body: accountSchema.pick({ email: true, password: true }),
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

      const account = await db.selectFrom(table).selectAll()
        .where('id', '=', decodedToken.id)
        .executeTakeFirstOrThrow();
      res.locals[table] = account;
      next();
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        res.status(401);
      } else if (error instanceof NoResultError) {
        res.status(404);
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
  signupValidator,
  loginValidator,
  itemValidator,
};
