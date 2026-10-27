import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { CMS_CRM_KEY } from '../../src/cms/cmsPackageKeys.ts';
import { createEmptyCrmFile } from '../../src/crm/crmDocument.ts';
import { createDatabase } from './api/db/client.ts';
import { loadDatabaseConfig } from './api/db/config.ts';
import { loadCmsApiEnv, readDotEnvFile } from './api/env.ts';
import { createCmsJsonStore, type CmsJsonStore } from './api/store.ts';

function assertLocalDatabaseUrl(url: string): void {
  const parsed = new URL(url);
  if (!['127.0.0.1', 'localhost'].includes(parsed.hostname)) {
    throw new Error('DATABASE_URL must point to a local database');
  }
}

async function listJsonFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => {
      const dir = 'parentPath' in entry && typeof entry.parentPath === 'string'
        ? entry.parentPath
        : (entry as { path?: string }).path ?? root;
      return path.join(dir, entry.name);
    });
}

export async function seedCmsJsonFromFilesystem(
  root: string,
  store: CmsJsonStore,
): Promise<{ keys: number }> {
  const files = await listJsonFiles(root);
  let keys = 0;
  let sawCrm = false;
  for (const abs of files) {
    const rel = path.relative(root, abs).split(path.sep).join('/');
    if (rel === 'manifest.json' || rel.endsWith('/manifest.json')) {
      continue;
    }
    const value = JSON.parse(await readFile(abs, 'utf8')) as unknown;
    await store.putJson(rel, value);
    keys += 1;
    if (rel === CMS_CRM_KEY) {
      sawCrm = true;
    }
  }
  if (!sawCrm) {
    await store.putJson(CMS_CRM_KEY, createEmptyCrmFile());
    keys += 1;
  }
  return { keys };
}

async function main(): Promise<void> {
  const rootDir = process.cwd();
  const env = await loadCmsApiEnv(rootDir);
  const fileEnv = await readDotEnvFile(path.join(rootDir, '.env.cms-dev'));
  const databaseUrl = process.env.DATABASE_URL ?? fileEnv.DATABASE_URL ?? '';
  assertLocalDatabaseUrl(databaseUrl);
  const database = createDatabase(
    loadDatabaseConfig({
      ...fileEnv,
      DATABASE_URL: databaseUrl,
      DATABASE_SSL: process.env.DATABASE_SSL ?? fileEnv.DATABASE_SSL,
      DATABASE_MAX_CONNECTIONS: process.env.DATABASE_MAX_CONNECTIONS ?? fileEnv.DATABASE_MAX_CONNECTIONS,
    }),
  );
  try {
    const store = createCmsJsonStore(env, database.db);
    const catalogRoot = env.localStoreDir;
    const result = await seedCmsJsonFromFilesystem(catalogRoot, store);
    process.stdout.write(`[cms:seed-json] upserted ${result.keys} keys from ${catalogRoot}\n`);
  } finally {
    await database.close();
  }
}

const invoked = process.argv[1] != null && path.basename(process.argv[1]).includes('seed-cms-json');
if (invoked) {
  await main();
}
