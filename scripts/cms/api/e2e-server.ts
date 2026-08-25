import { serve } from '@hono/node-server';
import path from 'node:path';
import { eq, inArray } from 'drizzle-orm';
import { CMS_E2E_RELEASE_ONE } from '../e2e-release-one-config.ts';
import {
  CMS_DRAFT_INDEX_KEY,
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
  cmsDraftDocumentKey,
  cmsDraftMetaKey,
} from '../../../src/cms/cmsPackageKeys.ts';
import { CMS_TOURS_SCHEMA_VERSION, type CmsTourDocument } from '../../../src/cms/cmsTourDocument.ts';
import { cmsDraftIndexFile } from '../../../src/cms/cmsDraftIndex.ts';
import { createCmsTourMeta } from '../../../src/cms/cmsTourMeta.ts';
import { createCmsApiApp, loadTourDocumentForDepartureWrite } from './app.ts';
import { createAuthRepository } from './auth/authRepository.ts';
import { createDatabase } from './db/client.ts';
import { loadDatabaseConfig } from './db/config.ts';
import { tourDepartures, users } from './db/schema.ts';
import type { CmsApiEnv } from './env.ts';
import { hashCmsPassword } from './password.ts';
import { createDepartureRepository } from './schedule/departureRepository.ts';
import { createMemoryJsonStore } from './store.ts';

const databaseUrl = process.env.DATABASE_URL ?? process.env.TEST_DATABASE_URL ?? CMS_E2E_RELEASE_ONE.databaseUrl;
const parsedDatabaseUrl = new URL(databaseUrl);
if (!['127.0.0.1', 'localhost'].includes(parsedDatabaseUrl.hostname)) {
  throw new Error('CMS e2e API requires a local DATABASE_URL');
}

const port = Number.parseInt(process.env.CMS_API_PORT ?? String(CMS_E2E_RELEASE_ONE.apiPort), 10);

const readyDocument: CmsTourDocument = {
  id: CMS_E2E_RELEASE_ONE.readyTourId,
  slug: CMS_E2E_RELEASE_ONE.readyTourId,
  season: 'winter',
  status: 'active',
  title: CMS_E2E_RELEASE_ONE.readyTourTitle,
  subtitle: 'Зима',
  heroPhrase: 'Ели',
  description: 'Левая колонка',
  descriptionLeadBold: 'Лид',
  descriptionAside: 'Правая колонка',
  duration: '1 день',
  durationDays: 1,
  difficulty: 'Medium',
  price: 'по запросу',
  program: [{ timeLabel: '04:30', description: 'Выезд' }],
  included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
  coverAssetId: 'cover',
  prefaceAssetId: 'preface',
  assets: [
    {
      id: 'cover',
      stillUrl: 'https://cdn.example/e2e-cover.webp',
      videoUrl: null,
      alt: 'Обложка',
    },
    {
      id: 'preface',
      stillUrl: 'https://cdn.example/e2e-preface.webp',
      videoUrl: null,
      alt: 'Предисловие',
    },
  ],
  bento: {
    blocks: [{ type: 'bento-single', slots: [{ assetId: 'cover' }] }],
  },
  legacyGalleryVariant: null,
};

const incompleteDocument: CmsTourDocument = {
  ...readyDocument,
  id: CMS_E2E_RELEASE_ONE.incompleteTourId,
  slug: CMS_E2E_RELEASE_ONE.incompleteTourId,
  title: CMS_E2E_RELEASE_ONE.incompleteTourTitle,
  subtitle: '',
};

const env: CmsApiEnv = {
  port,
  authSecret: 'e2e-release-one-auth-secret',
  cookieSecure: false,
  crmInboundSecret: 'e2e-inbound-secret',
  users: [
    {
      login: CMS_E2E_RELEASE_ONE.adminLogin,
      password: CMS_E2E_RELEASE_ONE.adminPassword,
      role: 'admin',
    },
    {
      login: CMS_E2E_RELEASE_ONE.editorLogin,
      password: CMS_E2E_RELEASE_ONE.editorPassword,
      role: 'editor',
    },
  ],
  s3: {
    bucket: 'vkraynosti-cms-e2e',
    endpoint: 'https://s3.example',
    region: 'ru-1',
    accessKey: 'e2e-key',
    secretKey: 'e2e-secret',
    forcePathStyle: true,
    publicBaseUrl: 'https://s3.example/vkraynosti-cms-e2e',
  },
  storeKind: 's3',
  localStoreDir: path.join(process.cwd(), 'tmp', 'cms-catalog'),
};

const database = createDatabase(
  loadDatabaseConfig({
    DATABASE_URL: databaseUrl,
    DATABASE_SSL: 'false',
    DATABASE_MAX_CONNECTIONS: '5',
  }),
);
const authRepository = createAuthRepository(database.db);

async function ensureUser(input: {
  login: string;
  password: string;
  role: 'admin' | 'editor';
}): Promise<string> {
  const passwordHash = hashCmsPassword(input.password);
  const existing = await authRepository.findUserByLogin(input.login);
  if (existing == null) {
    const created = await authRepository.createUser({
      login: input.login,
      passwordHash,
      role: input.role,
      isActive: true,
    });
    return created.id;
  }
  await database.db
    .update(users)
    .set({
      passwordHash,
      role: input.role,
      isActive: true,
      canPublishTours: false,
      canPublishSchedule: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, existing.id));
  return existing.id;
}

const adminUserId = await ensureUser({
  login: CMS_E2E_RELEASE_ONE.adminLogin,
  password: CMS_E2E_RELEASE_ONE.adminPassword,
  role: 'admin',
});
await ensureUser({
  login: CMS_E2E_RELEASE_ONE.editorLogin,
  password: CMS_E2E_RELEASE_ONE.editorPassword,
  role: 'editor',
});

const e2eTourIds = [CMS_E2E_RELEASE_ONE.readyTourId, CMS_E2E_RELEASE_ONE.incompleteTourId];
await database.db.delete(tourDepartures).where(inArray(tourDepartures.tourId, e2eTourIds));

const draftMeta = createCmsTourMeta({ rev: 1, editor: 'cms:e2e' });
const store = createMemoryJsonStore({
  [cmsDraftDocumentKey(readyDocument.id)]: readyDocument,
  [cmsDraftMetaKey(readyDocument.id)]: draftMeta,
  [cmsDraftDocumentKey(incompleteDocument.id)]: incompleteDocument,
  [cmsDraftMetaKey(incompleteDocument.id)]: draftMeta,
  [CMS_DRAFT_INDEX_KEY]: cmsDraftIndexFile([readyDocument.id, incompleteDocument.id]),
  [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: CMS_TOURS_SCHEMA_VERSION, tours: [] },
});

const departureRepository = createDepartureRepository(database.db, {
  loadTourDocument: (tourId) => loadTourDocumentForDepartureWrite(store, tourId),
});

const planned = await departureRepository.createDeparture({
  tourId: CMS_E2E_RELEASE_ONE.readyTourId,
  startsOn: CMS_E2E_RELEASE_ONE.plannedDate,
  actorUserId: adminUserId,
});
await departureRepository.updateDeparture({
  id: planned.id,
  version: planned.version,
  status: 'planned',
  actorUserId: adminUserId,
});

const cancelled = await departureRepository.createDeparture({
  tourId: CMS_E2E_RELEASE_ONE.readyTourId,
  startsOn: CMS_E2E_RELEASE_ONE.cancelledDate,
  actorUserId: adminUserId,
});
await departureRepository.updateDeparture({
  id: cancelled.id,
  version: cancelled.version,
  status: 'cancelled',
  actorUserId: adminUserId,
});

const app = createCmsApiApp({
  env,
  store,
  authRepository,
  departureRepository,
});

app.get('/__e2e__/schedule', async (c) => {
  const payload = await store.getJson(CMS_PUBLISHED_SCHEDULE_KEY);
  return c.json(payload ?? { events: [] });
});

serve(
  {
    fetch: app.fetch,
    port,
    hostname: '127.0.0.1',
  },
  (info) => {
    console.info(`CMS e2e API http://127.0.0.1:${info.port} (memory store, no S3)`);
  },
);

async function cleanupE2eDepartures(): Promise<void> {
  await database.db.delete(tourDepartures).where(inArray(tourDepartures.tourId, e2eTourIds));
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void cleanupE2eDepartures()
      .then(() => database.close())
      .finally(() => process.exit(0));
  });
}
