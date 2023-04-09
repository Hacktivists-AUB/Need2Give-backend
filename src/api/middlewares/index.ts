import { Request, Response, NextFunction } from 'express';
import z from 'zod';

import { idSchema, itemSchema } from '../../schemas';
import { createValidator, RequestSchema } from './requestValidator';
import errorHandler from './errorHandler';
import getAuthValidator from './getAuthValidator';

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

export {
  errorHandler,
  notFound,
  IDValidator,
  getAuthValidator,
  itemValidator,
  createValidator,
  RequestSchema,
};
