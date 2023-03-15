import db from './db';

async function main() {
  console.table(await db.selectFrom('account').selectAll().execute());
  db.destroy();
}

main();
