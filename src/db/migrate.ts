import { promises as fs } from 'fs';
import path from 'path';
import { FileMigrationProvider, Migrator } from 'kysely';
import db from '.';

const flags = {
  '--up': (m: Migrator) => m.migrateUp(),
  '--down': (m: Migrator) => m.migrateDown(),
  '--latest': (m: Migrator) => m.migrateToLatest(),
};

const helpText = `Usage:
npm run migrate:[ACTION]

Action:
  latest        Migrate to latest
  up            Migrate up
  down          Migrate down`;

async function main() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  const flag = process.argv[2];

  if (!Object.keys(flags).includes(flag)) {
    console.log(helpText);
    process.exit(1);
  }

  const { error, results } = await flags[flag as keyof typeof flags](migrator);

  db.destroy();

  results?.forEach((result) => {
    const migrationInfo = `Migration "${result.migrationName}"`;
    if (result.status === 'Success') {
      console.log(`${migrationInfo} was executed successfully`);
    } else if (result.status === 'NotExecuted') {
      console.log(`${migrationInfo} not executed"`);
    } else if (result.status === 'Error') {
      console.error(`${migrationInfo} failed!`);
    }
  });

  if (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
