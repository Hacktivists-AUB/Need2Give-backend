import { Request, Response, NextFunction } from 'express';
import config from '../../config';

const errorSeparator = '--------------------------------------------------';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(errorSeparator);
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

export default errorHandler;
