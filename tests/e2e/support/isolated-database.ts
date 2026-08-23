import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

type DatabaseClient = {
  connect(): Promise<void>;
  query(text: string, values?: readonly unknown[]): Promise<unknown>;
  end(): Promise<void>;
};

function envValue(source: string, name: string): string {
  const prefix = `${name}=`;
  const line = source
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(prefix));
  if (!line) throw new Error(`${name} is required for Playwright database tests.`);
  return line.slice(prefix.length);
}

export async function withEmptySermons(run: () => Promise<void>) {
  const backendRoot = path.resolve('../kaleo_youth_backend');
  const env = await readFile(path.join(backendRoot, '.env'), 'utf8');
  const backendRequire = createRequire(path.join(backendRoot, 'package.json'));
  const { Client } = backendRequire('pg') as {
    Client: new (config: Record<string, unknown>) => DatabaseClient;
  };
  const database = new Client({
    host: envValue(env, 'DB_HOST'),
    port: Number(envValue(env, 'DB_PORT')),
    user: envValue(env, 'DB_USERNAME'),
    password: envValue(env, 'DB_PASSWORD'),
    database:
      process.env.PLAYWRIGHT_DB_DATABASE ?? 'kaleo_youth_playwright',
  });

  await database.connect();
  try {
    await database.query(
      `CREATE TEMP TABLE qa_sermons_backup AS TABLE sermons;
       CREATE TEMP TABLE qa_sermon_attachments_backup AS
         SELECT * FROM attachments WHERE owner_type = 'sermon';
       DELETE FROM attachments WHERE owner_type = 'sermon';
       DELETE FROM sermons;`,
    );

    try {
      await run();
    } finally {
      await database.query(
        `DELETE FROM attachments WHERE owner_type = 'sermon';
         DELETE FROM sermons;
         INSERT INTO sermons SELECT * FROM qa_sermons_backup;
         INSERT INTO attachments SELECT * FROM qa_sermon_attachments_backup;`,
      );
    }
  } finally {
    await database.end();
  }
}
