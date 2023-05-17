import db from '.';
import { logTableData } from './utils';

async function dump() {
  await logTableData();
  await db.destroy();
}

dump();
