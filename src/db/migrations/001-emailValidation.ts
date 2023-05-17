import { sql } from 'kysely';
import database from '../index';

const INTEGER_MAX_VALUE = 2147483647;
const randomIntSql = sql<number>`random() * ${sql.lit(INTEGER_MAX_VALUE)}`;

export async function up(db: typeof database): Promise<void> {
  await db.schema.alterTable('pending_account')
    .addColumn('validation_key', 'integer', (col) => col.defaultTo(randomIntSql))
    .execute();

  await db.schema.alterTable('pending_donation_center')
    .addColumn('email_validated', 'boolean', (col) => col.defaultTo(false))
    .addColumn('admin_validated', 'boolean', (col) => col.defaultTo(false))
    .addColumn('admin_key', 'integer', (col) => col.defaultTo(randomIntSql))
    .execute();

  await db.schema.createTable('pending_user')
    .addColumn('id', 'serial', (col) => col.primaryKey()
      .references('pending_account.id').onDelete('cascade'))
    .addColumn('full_name', 'varchar(64)', (col) => col.notNull())
    .addColumn('birth_date', 'date', (col) => col.notNull())
    .execute();
}

export async function down(db: typeof database): Promise<void> {
  await db.schema.alterTable('pending_account')
    .dropColumn('validation_key')
    .execute();
  await db.schema.alterTable('pending_donation_center')
    .dropColumn('email_validated')
    .dropColumn('admin_validated')
    .dropColumn('admin_key')
    .execute();
  await db.schema.dropTable('pending_user').execute();
}
