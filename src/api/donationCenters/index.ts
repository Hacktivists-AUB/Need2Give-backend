import { Router, Request, Response } from 'express';
import { NoResultError } from 'kysely';
import { DatabaseError } from 'pg';
import z from 'zod';

import { getDonationCenterQuery } from '../utils';
import { IDValidator, getAuthValidator, createValidator } from '../middlewares';
import { DonationCenterSchema, donationCenterSchema } from '../../schemas';
import db from '../../db';
import { donationCenterSearchSchema, getQueryFromSearchSettings } from './utils';

const router = Router();

router.get(
  '/',
  createValidator({
    query: donationCenterSearchSchema,
  }),
  async (req: Request<{}, {}, {}, z.infer<typeof donationCenterSearchSchema>>, res, next) => {
    try {
      res.json({
        donation_centers: await getQueryFromSearchSettings(req.query).execute(),
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/:id', IDValidator, async (req, res, next) => {
  try {
    res.json({
      donation_center:
        await getDonationCenterQuery(Number(req.params.id)).executeTakeFirstOrThrow(),
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
  getAuthValidator('donation_center'),
  createValidator({ body: donationCenterSchema.omit({ id: true }).partial() }),
  async (req: Request<{}, {}, Omit<DonationCenterSchema, 'id'>>, res: Response, next) => {
    try {
      res.json({
        profile: await db.updateTable('donation_center').set(req.body)
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
