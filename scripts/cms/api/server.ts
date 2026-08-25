import { serve } from '@hono/node-server';
import path from 'node:path';
import { createAuthRepository } from './auth/authRepository.ts';
import { createDatabase } from './db/client.ts';
import { loadDatabaseConfig } from './db/config.ts';
import { loadCmsApiEnv, readDotEnvFile } from './env.ts';
import { createCmsApiApp, loadTourDocumentForDepartureWrite } from './app.ts';
import { createDepartureRepository } from './schedule/departureRepository.ts';
import { createCmsJsonStore } from './store.ts';

const rootDir = process.cwd();
const env = await loadCmsApiEnv(rootDir);
const fileEnv = await readDotEnvFile(path.join(rootDir, '.env.cms-dev'));
const database = createDatabase(
  loadDatabaseConfig({
    ...fileEnv,
    DATABASE_URL: process.env.DATABASE_URL ?? fileEnv.DATABASE_URL,
    DATABASE_SSL: process.env.DATABASE_SSL ?? fileEnv.DATABASE_SSL,
    DATABASE_MAX_CONNECTIONS:
      process.env.DATABASE_MAX_CONNECTIONS ?? fileEnv.DATABASE_MAX_CONNECTIONS,
  })
);
const store = createCmsJsonStore(env);
const app = createCmsApiApp({
  env,
  store,
  authRepository: createAuthRepository(database.db),
  departureRepository: createDepartureRepository(database.db, {
    loadTourDocument: (tourId) => loadTourDocumentForDepartureWrite(store, tourId),
  }),
});

serve(
  {
    fetch: app.fetch,
    port: env.port,
    hostname: '127.0.0.1',
  },
  (info) => {
    console.info(
      `CMS API http://127.0.0.1:${info.port} (store: ${env.storeKind}, proxy: /api/cms)`
    );
  }
);
