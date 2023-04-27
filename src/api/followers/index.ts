import { Router } from 'express';
import { NoResultError } from 'kysely';

import db from '../../db';
import { IDValidator, getAuthValidator } from '../middlewares';
import { getUserQuery } from '../utils';

const router = Router();

router.get(
  '/',
  getAuthValidator('donation_center'),
  async (req, res, next) => {
    try {
      res.json({
        followers: await getUserQuery()
          .innerJoin('follow', 'follower_id', 'user.id')
          .where('follow.donation_center_id', '=', Number(res.locals.profile.id))
          .execute(),
      });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:id',
  IDValidator,
  getAuthValidator('donation_center'),
  async (req, res, next) => {
    try {
      await db.deleteFrom('follow')
        .where('follower_id', '=', Number(req.params.id))
        .where('donation_center_id', '=', res.locals.profile.id)
        .returningAll()
        .executeTakeFirstOrThrow();
      res.json({
        status: 'ok',
      });
    } catch (error) {
      if (error instanceof NoResultError) {
        res.status(404);
      }
      next(error);
    }
  },
);

export default router;
