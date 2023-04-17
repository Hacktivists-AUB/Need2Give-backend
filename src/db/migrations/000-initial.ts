import { sql } from 'kysely';
import database from '../index';
import { ItemCategories } from '../../schemas/itemCategory';

export async function up(db: typeof database): Promise<void> {
  await sql`CREATE EXTENSION pg_trgm;`.execute(db);
  await sql`CREATE EXTENSION cube;`.execute(db);
  await sql`CREATE EXTENSION earthdistance;`.execute(db);

  await db.schema.createTable('account')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'varchar(320)', (col) => col.unique().notNull())
    .addColumn('phone_number', 'varchar(32)')
    .addColumn('username', 'varchar(64)', (col) => col.unique().notNull())
    .addColumn('password', 'varchar(128)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute();

  await db.schema.createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey()
      .references('account.id').onDelete('cascade'))
    .addColumn('full_name', 'varchar(64)', (col) => col.notNull())
    .addColumn('birth_date', 'date', (col) => col.notNull())
    .execute();

  await db.schema.createTable('donation_center')
    .addColumn('id', 'serial', (col) => col.primaryKey()
      .references('account.id').onDelete('cascade'))
    .addColumn('name', 'varchar(64)', (col) => col.unique().notNull())
    .addColumn('description', 'varchar(2048)')
    .addColumn('latitude', 'float8', (col) => col.notNull())
    .addColumn('longitude', 'float8', (col) => col.notNull())
    .addColumn('opening_days', 'jsonb', (col) => col.notNull())
    .addColumn('opening_time', 'time(0)', (col) => col.notNull())
    .addColumn('closing_time', 'time(0)', (col) => col.notNull())
    .execute();

  await db.schema.createTable('item_category')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(64)', (col) => col.notNull().unique())
    .execute();

  await db.schema.createTable('item')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(64)', (col) => col.notNull())
    .addColumn('description', 'varchar(2048)')
    .addColumn('donor_id', 'integer', (col) => col
      .references('user.id').onDelete('set null'))
    .addColumn('donation_center_id', 'integer', (col) => col
      .references('donation_center.id').onDelete('cascade'))
    .addColumn('quantity', 'integer', (col) => col.check(sql`quantity >= 0`).notNull())
    .addColumn('category', 'varchar(32)', (col) => col.notNull()
      .defaultTo(ItemCategories.other)
      .references('item_category.name')
      .onDelete('set default'))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute();

  await db.insertInto('item_category').values(
    (Object.values(ItemCategories)).map((name) => ({ name })),
  ).execute();

  await db.schema.createTable('pending_account')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'varchar(320)', (col) => col.unique().notNull())
    .addColumn('phone_number', 'varchar(32)')
    .addColumn('username', 'varchar(64)', (col) => col.unique().notNull())
    .addColumn('password', 'varchar(128)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute();

  await db.schema.createTable('pending_donation_center')
    .addColumn('id', 'serial', (col) => col.primaryKey()
      .references('pending_account.id').onDelete('cascade'))
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
  await db.schema.dropTable('item').ifExists().execute();
  await db.schema.dropTable('item_category').ifExists().execute();
  await db.schema.dropTable('donation_center').ifExists().execute();
  await db.schema.dropTable('pending_donation_center').ifExists().execute();
  await db.schema.dropTable('user').ifExists().execute();
  await db.schema.dropTable('pending_account').ifExists().execute();
  await db.schema.dropTable('account').ifExists().execute();

  await sql`DROP EXTENSION IF EXISTS earthdistance;`.execute(db);
  await sql`DROP EXTENSION IF EXISTS cube;`.execute(db);
  await sql`DROP EXTENSION IF EXISTS pg_trgm;`.execute(db);
}
