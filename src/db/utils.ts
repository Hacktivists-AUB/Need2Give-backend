import db, { Database } from './index';

const tables: (keyof Database)[] = [
  'account', 'user', 'donation_center', 'item', 'item_category',
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

export { getRandom, logTableData, deleteTableData };
