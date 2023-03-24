import { Router, Request } from 'express';
import bcrypt from 'bcrypt';

import db from '../../db';
import { AccountSchema } from '../../db/tables';
import { authValidator, loginValidator, signupValidator } from '../middlewares';
import { generateJWT, saltRounds } from './utils';

const router = Router();

router.post('/signup', signupValidator, async (req: Request<{}, {}, Omit<AccountSchema, 'id'>>, res, next) => {
  try {
    const duplicateAccount = await db.selectFrom('account').selectAll()
      .where('email', '=', req.body.email)
      .orWhere('username', '=', req.body.username)
      .executeTakeFirst();

    if (duplicateAccount) {
      res.status(400);
      next(new Error('This account already exists'));
      return;
    }

    const insertedAccount = await db.insertInto('account').values({
      ...req.body,
      password: await bcrypt.hash(req.body.password, saltRounds),
    }).returning(['id']).executeTakeFirstOrThrow();

    res.json({ token: generateJWT(insertedAccount.id) });
  } catch (error) {
    res.status(500);
    next(error);
  }
});

router.post('/login', loginValidator, async (req: Request<{}, {}, Pick<AccountSchema, 'email' | 'password'>>, res, next) => {
  try {
    const account = await db.selectFrom('account').selectAll()
      .where('email', '=', req.body.email).executeTakeFirst();

    if (!account) {
      res.status(400);
      next(new Error('Invalid email or password'));
      return;
    }

    const passwordMatches = await bcrypt.compare(
      req.body.password,
      account.password,
    );
    if (!passwordMatches) {
      res.status(400);
      next(new Error('Invalid email or password'));
      return;
    }

    res.json({ token: generateJWT(account.id) });
  } catch (error) {
    res.status(500);
    next(error);
  }
});

router.post('/test', authValidator);

export default router;
