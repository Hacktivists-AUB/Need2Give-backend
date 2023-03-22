import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createTable('account')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'varchar(320)', (col) => col.unique().notNull())
    .addColumn('phone_number', 'varchar(32)')
    .addColumn('username', 'varchar(64)', (col) => col.unique().notNull())
    .addColumn('password', 'varchar(128)', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('account').ifExists().execute();
}
