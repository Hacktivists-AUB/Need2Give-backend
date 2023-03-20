import express from 'express';
import accounts from './accounts';
import { errorHandler, notFound } from './middlewares';

const app = express();
app.use(express.json());

app.use('/accounts', accounts);

app.use(notFound);
app.use(errorHandler);

export default app;
