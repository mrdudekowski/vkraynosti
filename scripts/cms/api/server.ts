import { serve } from '@hono/node-server';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import { CMS_PUBLISHED_CATALOG_KEY } from '../../../src/cms/cmsPackageKeys.ts';
import { createAuthRepository } from './auth/authRepository.ts';
import { createDatabase } from './db/client.ts';
import { loadDatabaseConfig } from './db/config.ts';
import { loadCmsApiEnv, readDotEnvFile } from './env.ts';
import { createCmsApiApp, loadTourDocumentForDepartureWrite } from './app.ts';
import { createDepartureRepository } from './schedule/departureRepository.ts';
import { createStorageCircuit } from './storageCircuit.ts';
import { probeCatalogMirrorNow, runStorageBootProbes } from './storageBootProbe.ts';
import { createPostgresJsonStore } from './postgresJsonStore.ts';
import { setPublishedSyncState } from './publishedSyncState.ts';
import { reconcilePublishedJson } from './publishedStoreSync.ts';
import { createCmsJsonStore, createS3JsonStore } from './store.ts';

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
const publishedMirror =
  env.jsonStoreKind === 'postgres' && env.storeKind === 's3' ? createS3JsonStore(env.s3) : null;
if (publishedMirror == null) {
  setPublishedSyncState('match');
} else {
  try {
    const report = await reconcilePublishedJson(createPostgresJsonStore(database.db), publishedMirror);
    const drifted = report.filter((row) => row.status === 'differ').length;
    const repaired = report.filter((row) => row.repaired).length;
    console.info(`CMS published sync: ${report.length} keys, drift ${drifted}, repaired ${repaired}`);
  } catch (error) {
    setPublishedSyncState('unknown');
    console.error('CMS published sync failed', error);
  }
}
const store = createCmsJsonStore(env, database.db);
const storageCircuit = createStorageCircuit(
  async () => {
    await store.getBytes(env.storageCanaryKey);
  },
  {
    onStorageRecovery: () => probeCatalogMirrorNow({ env }),
  },
);
const app = createCmsApiApp({
  env,
  store,
  authRepository: createAuthRepository(database.db),
  departureRepository: createDepartureRepository(database.db, {
    loadTourDocument: (tourId) => loadTourDocumentForDepartureWrite(store, tourId),
  }),
  storageCircuit,
  probePostgres: async () => {
    await database.db.execute(sql`select 1`);
  },
  probeJsonStore: async () => {
    await store.getJson(CMS_PUBLISHED_CATALOG_KEY);
  },
  publishedMirror,
});

serve(
  {
    fetch: app.fetch,
    port: env.port,
    hostname: '0.0.0.0',
  },
  (info) => {
    console.info(
      `CMS API http://0.0.0.0:${info.port} (json: ${env.jsonStoreKind}, bytes: ${env.storeKind}, proxy: /api/cms)`
    );
    void runStorageBootProbes({ env, store, storageCircuit });
  }
);
