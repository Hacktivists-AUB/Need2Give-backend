import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import jwt from 'jsonwebtoken';

import config from '../../config';
import { accountSchema, idSchema } from '../../schemas';
import { createValidator } from './requestValidator';
import db from '../../db';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  next(new Error(`Not Found - ${req.path}`));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(res.statusCode || 500);
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

const authValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401);
      next(new Error('Unauthorized'));
      return;
    }

    const decodedToken = jwt.verify(token, config.JWT_SECRET_KEY) as jwt.JwtPayload;

    const account = await db.selectFrom('account').selectAll()
      .where('id', '=', decodedToken.id).executeTakeFirst();

    if (!account) {
      res.status(404);
      next(new Error('Account does not exist'));
      return;
    }

    next();
  } catch (err) {
    res.status(500);
    next(err);
  }
};

export {
  errorHandler,
  notFound,
  IDValidator,
  authValidator,
  signupValidator,
  loginValidator,
};
