import { Router } from 'express';

import db from '../../db';

const router = Router();

router.get(
  '/',
  async (req, res, next) => {
    try {
      res.json({
        item_categories: (await db.selectFrom('item_category')
          .selectAll()
          .execute())
          .map((category) => category.name),
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
