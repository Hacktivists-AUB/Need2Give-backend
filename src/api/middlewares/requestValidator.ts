import { Request, Response, NextFunction } from 'express';
import z from 'zod';

interface RequestValidator {
  params?: z.AnyZodObject,
  body?: z.AnyZodObject,
  query?: z.AnyZodObject,
}

function createValidator(validator: RequestValidator) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all((Object.keys(validator) as (keyof RequestValidator)[])
      .map(async (field) => {
        const zodObject = validator[field];
        if (!zodObject) {
          return;
        }
        try {
          req[field] = await zodObject.parseAsync(req[field]);
          next();
        } catch (error) {
          if (error instanceof z.ZodError) {
            res.status(400);
            next(new Error(error.issues.map((issue) => issue.message).join(' - ')));
          } else {
            next(error);
          }
        }
      }));
  };
}

export { RequestValidator, createValidator };
