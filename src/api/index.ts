import express from 'express';
import morgan from 'morgan';
import accounts from './accounts';
import donationCenters from './donationCenters';
import users from './users';
import auth from './auth';
import items from './items';
import { errorHandler, notFound } from './middlewares';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use('/accounts', accounts);
app.use('/items', items);
app.use('/auth', auth);
app.use('/donation_centers', donationCenters);
app.use('/users', users);

app.use(notFound);
app.use(errorHandler);

export default app;
