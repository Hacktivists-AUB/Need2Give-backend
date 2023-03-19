import express, { Request, Response, NextFunction } from 'express';
import config from './config';
import accounts from './api/accounts';

const app = express();

app.use(express.json());
app.use('/accounts', accounts);

app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.path}`));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(res.statusCode || 500);
  res.json({
    name: error.name,
    message: error.message,
    stack: (config.NODE_ENV === 'production') ? '' : error.stack,
  });
});

app.listen(config.SERVER_PORT, () => {
  console.log(`Listening at http://localhost:${config.SERVER_PORT}`);
});
