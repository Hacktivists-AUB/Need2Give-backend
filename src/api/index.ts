import express from 'express';
import morgan from 'morgan';
import auth from './auth';
import accounts from './accounts';
import donationCenters from './donationCenters';
import users from './users';
import items from './items';
import itemCategories from './itemCategories';
import follow from './follow';
import followers from './followers';
import { errorHandler, notFound } from './middlewares';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use('/auth', auth);
app.use('/accounts', accounts);
app.use('/donation_centers', donationCenters);
app.use('/users', users);
app.use('/items', items);
app.use('/item_categories', itemCategories);
app.use('/follow', follow);
app.use('/followers', followers);

app.use(notFound);
app.use(errorHandler);

export default app;
