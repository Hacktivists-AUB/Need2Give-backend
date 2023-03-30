/* eslint-disable radix */
import { Router } from 'express';
import db from '../../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const items = await db.selectFrom('item').selectAll().execute();
    res.send(items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// get a single item by ID
router.get('/:id', async (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  try {
    const item = await db.selectFrom('item').selectAll().where('item.id', '=', id).executeTakeFirst();
    console.log(item);
    if (!item) {
      res.status(404).send('Item not found');
    } else {
      res.send(item);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// create a new item
router.post('/', async (req, res) => {
  try {
    const newItem = await db.insertInto('item').values(
      { ...req.body },
    ).executeTakeFirst();
    res.status(201).send(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// update an item by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const item = req.body;
  try {
    const updatedItem = await db.updateTable('item').set({
      name: item.name,
      description: item.description,
      donor: item.donor,
      status: item.status,
      quantity: item.quantity,
      category: item.category,
    })
      .where('item.id', '=', id)
      .executeTakeFirst();

    if (!updatedItem) {
      res.status(404).send('Item not found');
    } else {
      res.send(updatedItem);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// delete an item by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.deleteFrom('item').where('item.id', '=', id).execute();
    res.send('Item deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
