import { TableExpression } from 'kysely';
import db, { Database } from './index';

const tables: TableExpression<Database, keyof Database>[] = [
  'account', 'user', 'donation_center', 'item', 'item_category',
];

async function logTableData() {
  (await Promise.all(
    tables.map((table) => db.selectFrom(table).selectAll().execute()),
  )).forEach((table) => console.table(table));
}

logTableData();
