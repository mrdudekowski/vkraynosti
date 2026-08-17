import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { DatabaseConfig } from './config.ts';
import * as schema from './schema.ts';
export function createDatabase(config: DatabaseConfig) {
  const client = postgres(config.url, {
    max: config.maxConnections,
    ssl: config.ssl ? 'require' : false,
  });
  return { db: drizzle(client, { schema }), close: () => client.end() };
}
export type CmsDatabase = ReturnType<typeof createDatabase>['db'];
