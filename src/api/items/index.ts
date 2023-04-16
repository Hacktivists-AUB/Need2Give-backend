import { Router, Request, Response } from 'express';
import { NoResultError, sql } from 'kysely';
import { DatabaseError } from 'pg';
import z from 'zod';

import db from '../../db';
import { IDValidator, getAuthValidator } from '../middlewares';
import { ItemSchema, idSchema, itemSchema } from '../../schemas';
import { createValidator } from '../middlewares/requestValidator';

const router = Router();

const itemSearchSchema = z.object({
  name: z.string().trim(),
  min_quantity: itemSchema.shape.quantity,
  max_quantity: itemSchema.shape.quantity,
  categories: z.preprocess(
    (str) => String(str).split(','),
    z.array(itemSchema.shape.category),
  ),
  ...itemSchema.pick({
    donor_id: true,
    donation_center_id: true,
  }).shape,
}).partial()
  .refine((obj) => (obj.min_quantity ?? 0) <= (obj.max_quantity ?? Infinity));

router.get(
  '/',
  createValidator({
    query: itemSearchSchema,
  }),
  async (req: Request<{}, {}, {}, z.infer<typeof itemSearchSchema>>, res, next) => {
    try {
      res.json({
        items: await db.selectFrom('item').selectAll()
          .$if(
            !!req.query.categories,
            (qb) => qb.where('category', 'in', req.query.categories!),
          ).$if(
            !!req.query.min_quantity,
            (qb) => qb.where('quantity', '>=', req.query.min_quantity!),
          ).$if(
            !!req.query.max_quantity,
            (qb) => qb.where('quantity', '<=', req.query.max_quantity!),
          ).$if(
            !!req.query.donor_id,
            (qb) => qb.where('donor_id', '=', req.query.donor_id!),
          ).$if(
            !!req.query.donation_center_id,
            (qb) => qb.where('donation_center_id', '=', req.query.donation_center_id!),
          ).$if(
            !!req.query.name,
            (qb) => qb.where(sql`name <<<-> ${req.query.name} < 0.8`),
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

const insertableItemSchema = itemSchema.omit({ id: true, created_at: true });

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
