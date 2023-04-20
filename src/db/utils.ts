import db, { Database } from './index';

const tables: (keyof Database)[] = [
  'account',
  'pending_account',
  'user',
  'donation_center',
  'pending_donation_center',
  'follow',
  'item',
  'item_category',
];

function showArrayAsTable<T extends { id: number }>(arr: T[]) {
  const filtered = arr.reduce(
    (acc, { id, ...x }) => { acc[id.toString()] = x; return acc; },
    {} as { [key: string]: any },
  );
  console.table(filtered);
}

async function logTableData() {
  (await Promise.all(
    tables.map((table) => db.selectFrom(table).selectAll().execute()),
  )).forEach(showArrayAsTable);
}

async function deleteTableData() {
  (await Promise.all(
    tables.filter((name) => name !== 'item_category')
      .map((table) => db.deleteFrom(table).execute()),
  ));
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
