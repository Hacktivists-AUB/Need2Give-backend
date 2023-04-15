import { Request, Response, NextFunction } from 'express';
import z from 'zod';

import { idSchema } from '../../schemas';
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

export {
  errorHandler,
  notFound,
  IDValidator,
  getAuthValidator,
  createValidator,
  RequestSchema,
};
