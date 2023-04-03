import { Router } from 'express';
import db from '../../db';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const items = await db.selectFrom('item').selectAll().execute();
    res.send(items);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await db.selectFrom('item').selectAll()
      .where('item.id', '=', id).executeTakeFirst();
    console.log(item);
    if (!item) {
      res.status(404);
      next(new Error('Item does not exist'));
      return;
    }
    res.send(item);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const newItem = await db.insertInto('item')
      .values(req.body)
      .executeTakeFirst();
    res.status(201).send(newItem);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const item = req.body;
  try {
    const updatedItem = await db.updateTable('item').set(item)
      .where('item.id', '=', id)
      .executeTakeFirst();

    if (!updatedItem) {
      res.status(404).send('Item not found');
    } else {
      res.send(updatedItem);
    }
  } catch (error) {
    res.status(500);
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  try {
    await db.deleteFrom('item').where('item.id', '=', id).execute();
    res.send('Item deleted successfully');
  } catch (error) {
    res.status(500);
    next(error);
  }
});

export default router;
