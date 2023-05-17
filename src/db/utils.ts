import config from '../config';
import db, { Database } from './index';

const tables: (keyof Database)[] = [
  'account',
  'pending_account',
  'user',
  'pending_user',
  'donation_center',
  'pending_donation_center',
  'follow',
  'item',
  'item_category',
];

function showArrayAsTable<T extends { id: number }>(arr: T[], tableName?: string) {
  const filtered = arr.reduce(
    (acc, { id, ...x }) => { acc[id.toString()] = x; return acc; },
    {} as { [key: string]: any },
  );
  if (tableName) console.log(`${tableName}:`);
  console.table(filtered);
}

async function logTableData() {
  if (config.NODE_ENV === 'development') {
    const tableData = await Promise.all(
      tables.map((table) => db.selectFrom(table).selectAll().execute()),
    );
    tableData.forEach((table, index) => showArrayAsTable(table, tables[index]));
  } else {
    // eslint-disable-next-line no-restricted-syntax
    for await (const table of tables) {
      showArrayAsTable(await db.selectFrom(table).selectAll().execute(), table);
    }
  }
}

async function deleteTableData() {
  if (config.NODE_ENV === 'development') {
    (await Promise.all(
      tables.filter((name) => name !== 'item_category')
        .map((table) => db.deleteFrom(table).execute()),
    ));
  } else {
    // eslint-disable-next-line no-restricted-syntax
    for await (const table of tables) {
      if (table !== 'item_category') {
        await db.deleteFrom(table).execute();
      }
    }
  }
}

function getRandom<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomSample<T>(array: T[], sampleSize: number) {
  return array.map((t) => ({ t, x: Math.random() }))
    .sort((a, b) => a.x - b.x)
    .slice(0, sampleSize)
    .map((a) => a.t);
}

function cartesianProduct<S, T>(arr1: S[], arr2: T[]) {
  return arr1.map(
    (first) => arr2.map(
      (second) => ({ first, second }),
    ),
  ).flat();
}

export {
  logTableData,
  deleteTableData,
  getRandom,
  getRandomSample,
  cartesianProduct,
};
