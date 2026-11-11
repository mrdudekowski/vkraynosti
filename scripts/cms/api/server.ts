import { serve } from '@hono/node-server';
import postgres from 'postgres';
import path from 'node:path';
import { createAuthRepository } from './auth/authRepository.ts';
import { createDatabase } from './db/client.ts';
import { loadDatabaseConfig } from './db/config.ts';
import { loadCmsApiEnv, readDotEnvFile } from './env.ts';
import { createCmsApiApp, loadTourDocumentForDepartureWrite } from './app.ts';
import { createDepartureRepository } from './schedule/departureRepository.ts';
import { createCmsJsonStore } from './store.ts';
import { createPostgresPublicReleaseCoordinator } from './publicReleaseCoordinator.ts';

const rootDir = process.cwd();
const env = await loadCmsApiEnv(rootDir);
const fileEnv = await readDotEnvFile(path.join(rootDir, '.env.cms-dev'));
const databaseConfig = loadDatabaseConfig({
    ...fileEnv,
    DATABASE_URL: process.env.DATABASE_URL ?? fileEnv.DATABASE_URL,
    DATABASE_SSL: process.env.DATABASE_SSL ?? fileEnv.DATABASE_SSL,
    DATABASE_MAX_CONNECTIONS:
      process.env.DATABASE_MAX_CONNECTIONS ?? fileEnv.DATABASE_MAX_CONNECTIONS,
  });
const database = createDatabase(databaseConfig);
// Keep the advisory-lock connection separate from CMS query connections. The
// locked publish handler can continue using PostgreSQL even when the main pool
// is configured with a single connection.
const publicReleaseLockClient = postgres(databaseConfig.url, {
  max: 1,
  ssl: databaseConfig.ssl ? 'require' : false,
});
const store = createCmsJsonStore(env);
const app = createCmsApiApp({
  env,
  store,
  publicReleaseCoordinator: createPostgresPublicReleaseCoordinator(publicReleaseLockClient),
  authRepository: createAuthRepository(database.db),
  departureRepository: createDepartureRepository(database.db, {
    loadTourDocument: (tourId) => loadTourDocumentForDepartureWrite(store, tourId),
  }),
});

serve(
  {
    fetch: app.fetch,
    port: env.port,
    hostname: '0.0.0.0',
  },
  (info) => {
    console.info(
      `CMS API http://0.0.0.0:${info.port} (store: ${env.storeKind}, proxy: /api/cms)`
    );
  }
);
