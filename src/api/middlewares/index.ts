import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import config from '../../config';
import { accountSchema, idSchema } from '../../db/tables';
import { createValidator } from './requestValidator';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  next(new Error(`Not Found - ${req.path}`));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
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

export {
  errorHandler,
  notFound,
  IDValidator,
  signupValidator,
  loginValidator,
};
