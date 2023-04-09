import { Router, Request, Response } from 'express';
import { NoResultError } from 'kysely';
import { DatabaseError } from 'pg';

import { getUserQuery } from '../utils';
import { IDValidator, getAuthValidator } from '../middlewares';
import { UserSchema, userSchema } from '../../schemas';
import { createValidator } from '../middlewares/requestValidator';
import db from '../../db';

const router = Router();

router.get('/', getAuthValidator('donation_center'), async (_req, res, next) => {
  try {
    res.json({
      users: await getUserQuery().execute(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', getAuthValidator('donation_center'), IDValidator, async (req, res, next) => {
  try {
    res.json({
      user: await getUserQuery(Number(req.params.id)).executeTakeFirstOrThrow(),
    });
  } catch (error) {
    if (error instanceof NoResultError) {
      res.status(404);
    }
    next(error);
  }
});

router.patch(
  '/',
  getAuthValidator('user'),
  createValidator({ body: userSchema.omit({ id: true }).partial() }),
  async (req: Request<{}, {}, Omit<UserSchema, 'id'>>, res: Response, next) => {
    try {
      res.json({
        profile: await db.updateTable('user').set(req.body)
          .where('id', '=', res.locals.profile.id)
          .returningAll()
          .executeTakeFirstOrThrow(),
      });
    } catch (error) {
      if (error instanceof NoResultError) {
        res.status(403);
      } else if (error instanceof DatabaseError) {
        res.status(400);
      }
      next(error);
    }
  },
);

export default router;
