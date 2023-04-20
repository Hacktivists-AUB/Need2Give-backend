import { Router } from 'express';
import { NoResultError } from 'kysely';
import { DatabaseError } from 'pg';

import db from '../../db';
import { IDValidator, getAuthValidator } from '../middlewares';
import { getDonationCenterQuery } from '../utils';

const router = Router();

router.get(
  '/',
  getAuthValidator('user'),
  async (req, res, next) => {
    try {
      res.json({
        donation_centers: await getDonationCenterQuery()
          .innerJoin('follow', 'donation_center_id', 'donation_center.id')
          .where('follower_id', '=', Number(res.locals.profile.id))
          .execute(),
      });
    } catch (error) {
      if (error instanceof NoResultError) {
        res.status(404);
      }
      next(error);
    }
  },
);

router.post(
  '/:id',
  IDValidator,
  getAuthValidator('user'),
  async (req, res, next) => {
    try {
      await db.insertInto('follow')
        .values({
          follower_id: res.locals.profile.id,
          donation_center_id: Number(req.params.id),
        })
        .executeTakeFirstOrThrow();
      res.json({
        status: 'ok',
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(400);
      }
      next(error);
    }
  },
);

router.delete(
  '/:id',
  IDValidator,
  getAuthValidator('user'),
  async (req, res, next) => {
    try {
      await db.deleteFrom('follow')
        .where('follower_id', '=', res.locals.profile.id)
        .where('donation_center_id', '=', Number(req.params.id))
        .returningAll()
        .executeTakeFirstOrThrow();
      res.json({
        status: 'ok',
      });
    } catch (error) {
      if (error instanceof NoResultError) {
        res.status(400);
      }
      next(error);
    }
  },
);

export default router;
