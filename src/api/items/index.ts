import { Router, Request, Response } from 'express';
import { NoResultError } from 'kysely';
import { DatabaseError } from 'pg';
import z from 'zod';

import db from '../../db';
import { IDValidator, getAuthValidator } from '../middlewares';
import { ItemSchema, idSchema } from '../../schemas';
import { createValidator } from '../middlewares/requestValidator';
import {
  itemSearchSchema,
  getQueryFromSearchSettings,
  insertableItemSchema,
} from './utils';

const router = Router();

router.get(
  '/',
  createValidator({
    query: itemSearchSchema,
  }),
  getAuthValidator('account'),
  async (req: Request<{}, {}, {}, z.infer<typeof itemSearchSchema>>, res, next) => {
    try {
      res.json({
        items: await getQueryFromSearchSettings(
          req.query,
          res.locals.role === 'user' ? res.locals.profile.id : undefined,
        ).execute(),
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/:id', IDValidator, async (req, res, next) => {
  try {
    res.json({
      item: await db.selectFrom('item').selectAll()
        .where('id', '=', Number(req.params.id))
        .executeTakeFirstOrThrow(),
    });
  } catch (error) {
    if (error instanceof NoResultError) {
      res.status(404);
    }
    next(error);
  }
});

router.post(
  '/',
  getAuthValidator('donation_center'),
  createValidator({
    body: insertableItemSchema,
  }),
  async (req: Request<{}, {}, Omit<ItemSchema, 'id'>>, res: Response, next) => {
    try {
      if (req.body.donation_center_id !== res.locals.profile.id) {
        res.status(403);
        throw new Error('Forbidden');
      }
      res.json({
        item: await db.insertInto('item')
          .values(req.body)
          .returningAll()
          .executeTakeFirstOrThrow(),
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(400);
      }
      next(error);
    }
  },
);

router.patch(
  '/:id',
  getAuthValidator('donation_center'),
  createValidator({
    params: z.object({ id: idSchema }),
    body: insertableItemSchema.partial(),
  }),
  async (req: Request<{ id: string }, {}, Omit<ItemSchema, 'id'>>, res, next) => {
    try {
      res.json({
        item: await db.updateTable('item').set(req.body)
          .where('id', '=', Number(req.params.id))
          .where('donation_center_id', '=', res.locals.profile.id)
          .returningAll()
          .executeTakeFirstOrThrow(),
      });
    } catch (error) {
      if (error instanceof NoResultError) {
        res.status(403);
        next(new Error('Forbidden'));
        return;
      }
      if (error instanceof DatabaseError) {
        res.status(400);
      }
      next(error);
    }
  },
);

router.delete(
  '/:id',
  getAuthValidator('donation_center'),
  IDValidator,
  async (req, res, next) => {
    try {
      res.json({
        item: await db.deleteFrom('item')
          .where('item.id', '=', Number(req.params.id))
          .where('donation_center_id', '=', res.locals.profile.id)
          .returningAll()
          .executeTakeFirstOrThrow(),
      });
    } catch (error) {
      if (error instanceof NoResultError) {
        res.status(403);
        next(new Error('Forbidden'));
        return;
      }
      next(error);
    }
  },
);

export default router;
