import database from '../index';

export async function up(db: typeof database): Promise<void> {
  await db.schema.createTable('account')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'varchar(320)', (col) => col.unique().notNull())
    .addColumn('phone_number', 'varchar(32)')
    .addColumn('username', 'varchar(64)', (col) => col.unique().notNull())
    .addColumn('password', 'varchar(128)', (col) => col.notNull())
    .execute();

  await db.schema.createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('account_id', 'integer', (col) => col.unique().notNull()
      .references('account.id').onDelete('cascade'))
    .addColumn('full_name', 'varchar(64)', (col) => col.unique().notNull())
    .addColumn('birth_date', 'date', (col) => col.notNull())
    .execute();

  await db.schema.createTable('donation_center')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('account_id', 'integer', (col) => col.unique().notNull()
      .references('account.id').onDelete('cascade'))
    .addColumn('name', 'varchar(64)', (col) => col.unique().notNull())
    .addColumn('description', 'varchar(2048)')
    .addColumn('latitude', 'float8', (col) => col.notNull())
    .addColumn('longitude', 'float8', (col) => col.notNull())
    .addColumn('opening_days', 'jsonb', (col) => col.notNull())
    .addColumn('opening_time', 'time(0)', (col) => col.notNull())
    .addColumn('closing_time', 'time(0)', (col) => col.notNull())
    .execute();
}

export async function down(db: typeof database): Promise<void> {
  await db.schema.dropTable('donation_center').ifExists().execute();
  await db.schema.dropTable('user').ifExists().execute();
  await db.schema.dropTable('account').ifExists().execute();
}
