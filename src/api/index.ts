import express from 'express';
import morgan from 'morgan';
import accounts from './accounts';
import auth from './auth';
import items from './items';
import { errorHandler, notFound } from './middlewares';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use('/accounts', accounts);
app.use('/auth', auth);
app.use('/items', items);

app.use(notFound);
app.use(errorHandler);

export default app;
