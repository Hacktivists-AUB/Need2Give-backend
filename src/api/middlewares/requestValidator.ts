import { Request, Response, NextFunction } from 'express';
import z from 'zod';

interface RequestSchema {
  params?: z.ZodTypeAny,
  body?: z.ZodTypeAny,
  query?: z.ZodTypeAny,
}

function createValidator(validator: RequestSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all((Object.keys(validator) as (keyof RequestSchema)[])
        .map(async (field) => {
          const zodObject = validator[field];
          if (!zodObject) {
            return;
          }
          req[field] = await zodObject.parseAsync(req[field]);
        }));
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400);
      }
      next(error);
    }
  };
}

export { RequestSchema, createValidator };
