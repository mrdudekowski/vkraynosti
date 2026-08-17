import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { loadDatabaseConfig } from './config.ts';

const config = loadDatabaseConfig(process.env);
const client = postgres(config.url, { max: 1, ssl: config.ssl ? 'require' : false });

await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
await client.end();
