/** @vitest-environment node */
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq, inArray, like } from 'drizzle-orm';
import { withOnlyActiveAdmins } from './withOnlyActiveAdmins.ts';
import type { CmsTourDocument } from '../../../src/cms/cmsTourDocument';
import {
  CMS_DRAFT_INDEX_KEY,
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
  cmsDraftDocumentKey,
  cmsDraftMetaKey,
} from '../../../src/cms/cmsPackageKeys';
import { mergeTourDataToSchedulePayload } from '../../../src/utils/tourData/mergeTourDataPayload';
import { createCmsApiApp, loadTourDocumentForDepartureWrite } from './app';
import { createAuthRepository } from './auth/authRepository.ts';
import { createDatabase } from './db/client.ts';
import { auditLog, sessions, tourDepartures, users } from './db/schema.ts';
import type { CmsApiEnv } from './env';
import { hashCmsPassword } from './password.ts';
import { createDepartureRepository } from './schedule/departureRepository.ts';
import { CMS_SESSION_COOKIE, hashSessionToken } from './session.ts';
import { createMemoryJsonStore } from './store';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl == null || testDatabaseUrl.trim() === '') {
  throw new Error('TEST_DATABASE_URL is required for CMS API integration tests');
}
const parsedTestDatabaseUrl = new URL(testDatabaseUrl);
if (!['127.0.0.1', 'localhost'].includes(parsedTestDatabaseUrl.hostname)) {
  throw new Error('TEST_DATABASE_URL must point to a local database');
}
const databaseConfig = { url: testDatabaseUrl, ssl: false, maxConnections: 1 };
const database = createDatabase(databaseConfig);
const authRepository = createAuthRepository(database.db);
const testRunPrefix = `task4-${randomUUID().slice(0, 8)}`;
const adminLogin = `${testRunPrefix}-admin`;
const editorLogin = `${testRunPrefix}-editor`;
const nikaLogin = `${testRunPrefix}-nika`;
let adminUserId = '';
let editorUserId = '';

const document: CmsTourDocument = {
  id: 'winter-1',
  slug: 'izubrinaya',
  season: 'winter',
  status: 'active',
  title: 'Изюбриная',
  subtitle: 'Зима',
  heroPhrase: 'Ели',
  description: 'Старый текст',
  descriptionLeadBold: 'Гора',
  descriptionAside: 'право',
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
      stillUrl: 'https://cdn.example/cover.webp',
      videoUrl: null,
      alt: 'Обложка',
    },
    {
      id: 'preface',
      stillUrl: 'https://cdn.example/preface.webp',
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
  ...document,
  id: 'winter-incomplete',
  slug: 'winter-incomplete',
  subtitle: '',
};

const unpublishedReady: CmsTourDocument = {
  ...document,
  id: 'winter-2',
  slug: 'winter-2',
};

const env: CmsApiEnv = {
  port: 8787,
  authSecret: 'test-auth-secret-16',
  cookieSecure: false,
  cookieSameSite: 'None',
  crmInboundSecret: 'inbound-secret-16',
  users: [
    { login: adminLogin, password: 'admin-pass', role: 'admin' },
    { login: editorLogin, password: 'editor-pass', role: 'editor' },
  ],
  s3: {
    bucket: 'vkraynosti-cms-dev',
    endpoint: 'https://s3.example',
    region: 'ru-1',
    accessKey: 'key',
    secretKey: 'secret',
    forcePathStyle: true,
    publicBaseUrl: 'https://s3.example/vkraynosti-cms-dev',
  },
  storeKind: 's3',
  localStoreDir: path.join(process.cwd(), 'tmp', 'cms-catalog'),
};

function cookieFrom(response: Response): string {
  const raw = response.headers.get('set-cookie');
  if (raw == null) {
    return '';
  }
  return raw.split(';')[0] ?? '';
}

function rawSessionTokenFromSetCookie(setCookie: string | null): string {
  const first = (setCookie ?? '').split(';')[0] ?? '';
  const prefix = `${CMS_SESSION_COOKIE}=`;
  expect(first.startsWith(prefix)).toBe(true);
  return decodeURIComponent(first.slice(prefix.length));
}

function createApp() {
  const store = createMemoryJsonStore({
    'draft/tours/winter-1/document.json': document,
    'draft/tours/winter-1/meta.json': {
      rev: 1,
      updatedAt: '2026-08-14T00:00:00.000Z',
      editor: 'cms:export',
    },
    'published/tours/winter-1/document.json': document,
    'draft/tours/winter-incomplete/document.json': incompleteDocument,
    [cmsDraftDocumentKey(unpublishedReady.id)]: unpublishedReady,
    [cmsDraftMetaKey(unpublishedReady.id)]: {
      rev: 1,
      updatedAt: '2026-08-14T00:00:00.000Z',
      editor: 'cms:export',
    },
    [CMS_DRAFT_INDEX_KEY]: { schemaVersion: 1, tourIds: [unpublishedReady.id] },
    [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [document] },
  });
  const departureRepository = createDepartureRepository(database.db, {
    loadTourDocument: (tourId) => loadTourDocumentForDepartureWrite(store, tourId),
  });
  return {
    app: createCmsApiApp({ env, store, authRepository, departureRepository }),
    departureRepository,
    store,
  };
}

async function cleanupTestDatabase(): Promise<void> {
  const testUsers = await database.db.select({ id: users.id }).from(users)
    .where(like(users.login, `${testRunPrefix}-%`));
  const userIds = testUsers.map((user) => user.id);
  if (userIds.length === 0) return;
  await database.db.delete(tourDepartures).where(inArray(tourDepartures.createdBy, userIds));
  await database.db.delete(auditLog).where(inArray(auditLog.actorUserId, userIds));
  await database.db.delete(sessions).where(inArray(sessions.userId, userIds));
  await database.db.delete(users).where(inArray(users.id, userIds));
}

beforeAll(async () => {
  const admin = await authRepository.createUser({
    login: adminLogin, passwordHash: hashCmsPassword('admin-pass'), role: 'admin',
  });
  const editor = await authRepository.createUser({
    login: editorLogin, passwordHash: hashCmsPassword('editor-pass'), role: 'editor',
  });
  adminUserId = admin.id;
  editorUserId = editor.id;
});

beforeEach(async () => {
  const testUsers = await database.db.select({ id: users.id }).from(users)
    .where(like(users.login, `${testRunPrefix}-%`));
  const userIds = testUsers.map((user) => user.id);
  if (userIds.length > 0) {
    await database.db.delete(tourDepartures).where(inArray(tourDepartures.createdBy, userIds));
    await database.db.delete(auditLog).where(inArray(auditLog.actorUserId, userIds));
    await database.db.delete(sessions).where(inArray(sessions.userId, userIds));
  }
  const extraIds = userIds.filter((id) => id !== adminUserId && id !== editorUserId);
  if (extraIds.length > 0) {
    await database.db.delete(users).where(inArray(users.id, extraIds));
  }
  await database.db.update(users).set({
    passwordHash: hashCmsPassword('admin-pass'),
    role: 'admin',
    isActive: true,
    canPublishTours: false,
    canPublishSchedule: false,
  }).where(eq(users.id, adminUserId));
  await database.db.update(users).set({
    passwordHash: hashCmsPassword('editor-pass'),
    role: 'editor',
    isActive: true,
    canPublishTours: false,
    canPublishSchedule: false,
  }).where(eq(users.id, editorUserId));
});

afterAll(async () => {
  await cleanupTestDatabase();
  await database.close();
});

async function login(
  app: ReturnType<typeof createCmsApiApp>,
  loginName = adminLogin,
  password = 'admin-pass'
): Promise<string> {
  const response = await app.request('/api/cms/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ login: loginName, password }),
  });
  expect(response.status).toBe(200);
  return cookieFrom(response);
}

describe('CMS API', () => {
  it('логинит и отдаёт сессию', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const me = await app.request('/api/cms/me', { headers: { cookie } });
    expect(me.status).toBe(200);
    await expect(me.json()).resolves.toEqual({
      login: adminLogin,
      role: 'admin',
      canPublishTours: true,
      canPublishSchedule: true,
    });
  });

  it('выдаёт cross-origin cookie для отдельного admin frontend', async () => {
    const { app } = createApp();
    const response = await app.request('/api/cms/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ login: adminLogin, password: 'admin-pass' }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('SameSite=None');
  });

  it('stores a hashed session and returns 401 after revoke', async () => {
    const { app } = createApp();
    const loginResponse = await app.request('/api/cms/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ login: adminLogin, password: 'admin-pass' }),
    });
    expect(loginResponse.status).toBe(200);
    const setCookie = loginResponse.headers.get('set-cookie');
    expect(setCookie).toContain(`${CMS_SESSION_COOKIE}=`);
    const rawToken = rawSessionTokenFromSetCookie(setCookie);
    expect(rawToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const tokenHash = hashSessionToken(rawToken);
    const [stored] = await database.db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash));
    expect(stored).toMatchObject({ tokenHash, userId: adminUserId, revokedAt: null });

    const cookie = cookieFrom(loginResponse);
    const me = await app.request('/api/cms/me', { headers: { cookie: setCookie ?? '' } });
    expect(me.status).toBe(200);

    const logout = await app.request('/api/cms/logout', {
      method: 'POST',
      headers: { cookie },
    });
    expect(logout.status).toBe(200);

    const meAfterRevoke = await app.request('/api/cms/me', { headers: { cookie } });
    expect(meAfterRevoke.status).toBe(401);
  });

  it('returns 401 for unauthenticated /api/cms/me', async () => {
    const { app } = createApp();
    const response = await app.request('/api/cms/me');
    expect(response.status).toBe(401);
  });

  it('отклоняет неверный пароль', async () => {
    const { app } = createApp();
    const response = await app.request('/api/cms/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ login: adminLogin, password: 'nope' }),
    });
    expect(response.status).toBe(401);
  });

  it('без cookie не отдаёт туры', async () => {
    const { app } = createApp();
    const response = await app.request('/api/cms/tours');
    expect(response.status).toBe(401);
  });

  it('сохраняет тексты, бампит rev и пересобирает каталог', async () => {
    const { app, store } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'Новый текст',
          descriptionLeadBold: 'Лид',
          prefaceAssetId: 'preface',
          included: [{ text: 'Гид', iconKey: 'user-tie' }],
          program: [{ timeLabel: '05:00', description: 'Сбор' }],
        },
      }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      document: CmsTourDocument;
      meta: { rev: number; editor: string };
    };
    expect(body.document.description).toBe('Новый текст');
    expect(body.document.bento).toEqual(document.bento);
    expect(body.meta.rev).toBe(2);
    expect(body.meta.editor).toBe(editorLogin);

    const catalog = (await store.getJson(CMS_PUBLISHED_CATALOG_KEY)) as {
      tours: CmsTourDocument[];
    };
    expect(catalog.tours[0]?.description).toBe('Старый текст');
  });

  it('отдаёт 409 при устаревшем rev', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 99,
        patch: {
          description: 'x',
          prefaceAssetId: 'preface',
          included: [],
          program: [],
        },
      }),
    });
    expect(response.status).toBe(409);
    const current = await app.request('/api/cms/tours/winter-1', { headers: { cookie } });
    const body = (await current.json()) as { meta: { rev: number } };
    expect(body.meta.rev).toBe(1);
  });

  it('отдаёт 400 на неизвестную иконку', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'x',
          prefaceAssetId: 'preface',
          included: [{ text: 'x', iconKey: 'not-an-icon' }],
          program: [],
        },
      }),
    });
    expect(response.status).toBe(400);
  });

  it('сохраняет сетку bento', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'Старый текст',
          prefaceAssetId: 'preface',
          included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
          program: [{ timeLabel: '04:30', description: 'Выезд' }],
        },
        layout: {
          coverAssetId: 'cover',
          coverCrop: { card: { x: 20, y: 80 }, hero: { x: 50, y: 32 } },
          bento: {
            blocks: [
              { type: 'bento-single', slots: [{ assetId: 'preface' }] },
            ],
          },
        },
      }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { document: CmsTourDocument };
    expect(body.document.bento.blocks[0]?.slots[0]?.assetId).toBe('preface');
    expect(body.document.coverCrop).toEqual({ card: { x: 20, y: 80 }, hero: { x: 50, y: 32 } });
  });

  it('загружает still в пул', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    const form = new FormData();
    form.set('rev', '1');
    form.set('alt', 'Новый кадр');
    form.set('still', new File([new Uint8Array([1, 2, 3, 4])], 'shot.webp', { type: 'image/webp' }));
    const response = await app.request('/api/cms/tours/winter-1/assets', {
      method: 'POST',
      headers: { cookie },
      body: form,
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      document: CmsTourDocument;
      meta: { rev: number };
      assetId: string;
    };
    expect(body.assetId).toBe('u-1');
    expect(body.meta.rev).toBe(2);
    const uploaded = body.document.assets.find((asset) => asset.id === 'u-1');
    expect(uploaded?.stillUrl).toBe(
      'https://s3.example/vkraynosti-cms-dev/media/tours/winter-1/u-1.webp'
    );
    expect(uploaded?.alt).toBe('Новый кадр');
    const catalog = (await store.getJson(CMS_PUBLISHED_CATALOG_KEY)) as {
      tours: CmsTourDocument[];
    };
    expect(catalog.tours[0]?.assets.some((asset) => asset.id === 'u-1')).toBe(false);
  });

  it('отклоняет still неверного типа', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const form = new FormData();
    form.set('rev', '1');
    form.set('still', new File([new Uint8Array([1])], 'shot.gif', { type: 'image/gif' }));
    const response = await app.request('/api/cms/tours/winter-1/assets', {
      method: 'POST',
      headers: { cookie },
      body: form,
    });
    expect(response.status).toBe(400);
  });

  it('публикует черновик в каталог только от admin', async () => {
    const { app, store } = createApp();
    const editorCookie = await login(app, editorLogin, 'editor-pass');
    const forbidden = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie: editorCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: 1 }),
    });
    expect(forbidden.status).toBe(403);

    const adminCookie = await login(app);
    const saved = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'После публикации',
          descriptionAside: 'право',
          prefaceAssetId: 'preface',
          included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
          program: [{ timeLabel: '04:30', description: 'Выезд' }],
          durationDays: 1,
        },
      }),
    });
    expect(saved.status).toBe(200);

    const published = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: 2 }),
    });
    expect(published.status).toBe(200);
    const catalog = (await store.getJson(CMS_PUBLISHED_CATALOG_KEY)) as {
      tours: CmsTourDocument[];
    };
    expect(catalog.tours[0]?.description).toBe('После публикации');
    const toursList = (await store.getJson(CMS_PUBLISHED_TOURS_LIST_KEY)) as {
      schemaVersion: number;
      tours: Array<{ id: string; publicationStatus: string }>;
    };
    expect(toursList.schemaVersion).toBe(1);
    expect(toursList.tours).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'winter-1', publicationStatus: 'active' }),
      ]),
    );
  });

  it('публикует, даже если в пуле остался свободный кадр', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const form = new FormData();
    form.set('rev', '1');
    form.set('still', new File([new Uint8Array([1, 2, 3, 4])], 'shot.webp', { type: 'image/webp' }));
    const uploaded = await app.request('/api/cms/tours/winter-1/assets', {
      method: 'POST',
      headers: { cookie },
      body: form,
    });
    expect(uploaded.status).toBe(201);
    const response = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: 2 }),
    });
    expect(response.status).toBe(200);
  });

  it('сохраняет пустой слот bento', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'Старый текст',
          prefaceAssetId: 'preface',
          included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
          program: [{ timeLabel: '04:30', description: 'Выезд' }],
        },
        layout: {
          coverAssetId: 'cover',
          bento: {
            blocks: [{ type: 'bento-single', slots: [{ assetId: null }] }],
          },
        },
      }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { document: CmsTourDocument };
    expect(body.document.bento.blocks[0]?.slots[0]?.assetId).toBeNull();
  });

  it('удаляет свободный кадр пула и не трогает занятый', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const form = new FormData();
    form.set('rev', '1');
    form.set('still', new File([new Uint8Array([1, 2, 3, 4])], 'shot.webp', { type: 'image/webp' }));
    const uploaded = await app.request('/api/cms/tours/winter-1/assets', {
      method: 'POST',
      headers: { cookie },
      body: form,
    });
    expect(uploaded.status).toBe(201);

    const blocked = await app.request('/api/cms/tours/winter-1/assets/cover?rev=2', {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(blocked.status).toBe(409);
    const blockedBody = (await blocked.json()) as { error: string };
    expect(blockedBody.error).toBe('asset_in_use');

    const removed = await app.request('/api/cms/tours/winter-1/assets/u-1?rev=2', {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(removed.status).toBe(200);
    const body = (await removed.json()) as {
      document: CmsTourDocument;
      meta: { rev: number };
    };
    expect(body.meta.rev).toBe(3);
    expect(body.document.assets.some((asset) => asset.id === 'u-1')).toBe(false);
  });

  it('создаёт пользователя и пускает его в логин', async () => {
    const { app } = createApp();
    const adminCookie = await login(app);
    const created = await app.request('/api/cms/users', {
      method: 'POST',
      headers: { cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        login: nikaLogin,
        password: 'nika-pass',
        role: 'editor',
      }),
    });
    expect(created.status).toBe(201);
    const listed = (await created.json()) as { users: Array<{ login: string }> };
    expect(listed.users.some((user) => user.login === nikaLogin)).toBe(true);

    const editorCookie = await login(app, nikaLogin, 'nika-pass');
    const forbidden = await app.request('/api/cms/users', { headers: { cookie: editorCookie } });
    expect(forbidden.status).toBe(403);
    const forbiddenCreate = await app.request('/api/cms/users', {
      method: 'POST',
      headers: { cookie: editorCookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        login: `${testRunPrefix}-other`,
        password: 'other-pass',
        role: 'editor',
      }),
    });
    expect(forbiddenCreate.status).toBe(403);
  });

  it('не даёт удалить последнего admin', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request(`/api/cms/users/${adminLogin}`, {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(response.status).toBe(409);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('cannot_delete_self');
  });

  it('rejects self-delete when login case differs and another admin exists', async () => {
    const { app } = createApp();
    const mixedLogin = `${testRunPrefix}-MixedAdmin`;
    const mixedAdmin = await authRepository.createUser({
      login: mixedLogin,
      passwordHash: hashCmsPassword('mixed-pass'),
      role: 'admin',
    });

    await withOnlyActiveAdmins(database.db, [adminUserId, mixedAdmin.id], async () => {
      const cookie = await login(app, mixedLogin, 'mixed-pass');
      const response = await app.request(`/api/cms/users/${mixedLogin.toLowerCase()}`, {
        method: 'DELETE',
        headers: { cookie },
      });
      expect(response.status).toBe(409);
      const body = (await response.json()) as { error: string };
      expect(body.error).toBe('cannot_delete_self');
    });
  });

  it('allows demoting an inactive admin when another active admin exists', async () => {
    const { app } = createApp();
    const inactiveLogin = `${testRunPrefix}-inactive-demote`;
    await authRepository.createUser({
      login: inactiveLogin,
      passwordHash: hashCmsPassword('inactive-pass'),
      role: 'admin',
      isActive: false,
    });

    await withOnlyActiveAdmins(database.db, [adminUserId], async () => {
      const cookie = await login(app);
      const response = await app.request(`/api/cms/users/${inactiveLogin}`, {
        method: 'PUT',
        headers: { cookie, 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'editor' }),
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as { users: Array<{ login: string; role: string }> };
      expect(body.users.find((user) => user.login === inactiveLogin)?.role).toBe('editor');
    });
  });

  it('allows deleting an inactive admin when another active admin exists', async () => {
    const { app } = createApp();
    const inactiveLogin = `${testRunPrefix}-inactive-delete`;
    await authRepository.createUser({
      login: inactiveLogin,
      passwordHash: hashCmsPassword('inactive-pass'),
      role: 'admin',
      isActive: false,
    });

    await withOnlyActiveAdmins(database.db, [adminUserId], async () => {
      const cookie = await login(app);
      const response = await app.request(`/api/cms/users/${inactiveLogin}`, {
        method: 'DELETE',
        headers: { cookie },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as { users: Array<{ login: string }> };
      expect(body.users.some((user) => user.login === inactiveLogin)).toBe(false);
    });
  });

  it('does not demote the last active admin', async () => {
    const { app } = createApp();
    await withOnlyActiveAdmins(database.db, [adminUserId], async () => {
      const cookie = await login(app);
      const response = await app.request(`/api/cms/users/${adminLogin}`, {
        method: 'PUT',
        headers: { cookie, 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'editor' }),
      });
      expect(response.status).toBe(409);
      const body = (await response.json()) as { error: string };
      expect(body.error).toBe('last_admin');
    });
  });

  it('создаёт черновик тура со slug из названия и показывает его в списке', async () => {
    const { app } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');
    const response = await app.request('/api/cms/tours', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Полуостров Краббе', season: 'summer' }),
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      document: CmsTourDocument;
      meta: { rev: number; editor: string };
    };
    expect(body.document.id).toBe('summer-1');
    expect(body.document.slug).toBe('poluostrov-krabbe');
    expect(body.document.status).toBe('draft');
    expect(body.document.title).toBe('Полуостров Краббе');
    expect(body.document.bento.blocks).toEqual([]);
    expect(body.meta.rev).toBe(1);
    expect(body.meta.editor).toBe(editorLogin);

    const list = await app.request('/api/cms/tours', { headers: { cookie } });
    expect(list.status).toBe(200);
    const listed = (await list.json()) as {
      tours: Array<{ id: string; title: string; status: string }>;
    };
    expect(listed.tours.some((tour) => tour.id === 'summer-1' && tour.title === 'Полуостров Краббе')).toBe(
      true,
    );
    const winter = listed.tours.find((tour) => tour.id === 'winter-1') as
      | { published?: boolean; imageUrl?: string | null }
      | undefined;
    expect(winter?.published).toBe(true);
    expect(winter?.imageUrl).toBe('https://cdn.example/cover.webp');
  });

  it('сохраняет название и человекопонятный URL', async () => {
    const { app } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          title: 'Восхождение на Изюбриную',
          slug: 'voskhozhdenie-na-izyubrinuyu',
          description: 'Старый текст',
          prefaceAssetId: 'preface',
          included: document.included,
          program: document.program,
        },
      }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { document: CmsTourDocument };
    expect(body.document.title).toBe('Восхождение на Изюбриную');
    expect(body.document.slug).toBe('voskhozhdenie-na-izyubrinuyu');
  });

  it('не даёт занять чужой slug', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/tours', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Другой тур', season: 'summer', slug: 'izubrinaya' }),
    });
    expect(created.status).toBe(409);
    const body = (await created.json()) as { error: string };
    expect(body.error).toBe('slug_taken');
  });
});

describe('CMS CRM API', () => {
  it('создаёт лид с туром и датой', async () => {
    const { app } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');
    const created = await app.request('/api/cms/crm/people', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        person: { name: 'Анна', phone: '+79001112233', messenger: 'telegram' },
        deal: { tourId: 'winter-1', tourTitle: 'Изюбриная', date: '2026-08-20', comment: 'подумает' },
      }),
    });
    expect(created.status).toBe(201);
    const body = (await created.json()) as {
      people: Array<{ name: string }>;
      deals: Array<{ tourTitle: string; date: string }>;
    };
    expect(body.people[0]?.name).toBe('Анна');
    expect(body.deals[0]?.tourTitle).toBe('Изюбриная');
    expect(body.deals[0]?.date).toBe('2026-08-20');
  });

  it('принимает заявку с сайта по секрету', async () => {
    const { app } = createApp();
    const created = await app.request('/api/cms/crm/inbound', {
      method: 'POST',
      headers: {
        authorization: 'Bearer inbound-secret-16',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Игорь',
        phone: '+79002223344',
        preferredMessenger: 'whatsapp',
        tourId: 'winter-1',
        tourTitle: 'Изюбриная',
        preferredDepartureDate: '2026-09-01',
        source: 'site',
      }),
    });
    expect(created.status).toBe(201);
    const cookie = await login(app);
    const list = await app.request('/api/cms/crm', { headers: { cookie } });
    const body = (await list.json()) as { deals: Array<{ source: string; date: string }> };
    expect(body.deals[0]?.source).toBe('site');
    expect(body.deals[0]?.date).toBe('2026-09-01');
  });
});

describe('CMS Schedule API', () => {
  it('requires authentication to list departures', async () => {
    const { app } = createApp();

    const response = await app.request(
      '/api/cms/departures?from=2031-01-01&to=2031-01-31',
    );

    expect(response.status).toBe(401);
  });

  it('requires valid from and to dates to list departures', async () => {
    const { app } = createApp();
    const cookie = await login(app);

    const missing = await app.request('/api/cms/departures?from=2031-01-01', {
      headers: { cookie },
    });
    const invalid = await app.request(
      '/api/cms/departures?from=2031-02-30&to=2031-03-01',
      { headers: { cookie } },
    );

    expect(missing.status).toBe(400);
    expect(invalid.status).toBe(400);
  });

  it('lists departures with computed ISO end dates', async () => {
    const { app, departureRepository } = createApp();
    const cookie = await login(app);
    await departureRepository.createDeparture({
      tourId: document.id,
      startsOn: '2031-01-10',
      actorUserId: adminUserId,
    });

    const response = await app.request(
      '/api/cms/departures?from=2031-01-01&to=2031-01-31',
      { headers: { cookie } },
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      departures: Array<{ startsOn: string; endsOn?: string }>;
    };
    expect(body.departures).toHaveLength(1);
    expect(body.departures[0]).toMatchObject({
      startsOn: '2031-01-10',
      endsOn: '2031-01-10',
    });
  });

  it('does not complete elapsed departures just by listing them', async () => {
    const { app, departureRepository } = createApp();
    const cookie = await login(app);
    await departureRepository.createDeparture({
      tourId: document.id,
      startsOn: '2020-01-10',
      actorUserId: adminUserId,
    });

    const activeResponse = await app.request(
      '/api/cms/departures?from=2020-01-01&to=2020-01-31',
      { headers: { cookie } },
    );

    expect(activeResponse.status).toBe(200);
    await expect(activeResponse.json()).resolves.toMatchObject({
      departures: [{ startsOn: '2020-01-10', status: 'open' }],
    });
  });

  it('creates an open departure with eight seats by default', async () => {
    const { app } = createApp();
    const cookie = await login(app);

    const response = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-01-11' }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      tourId: document.id,
      startsOn: '2031-01-11',
      status: 'open',
      seats: 8,
      version: 1,
    });
  });

  it.each(['2031-1-2', '2031-02-30'])(
    'returns invalid_starts_on when creating with startsOn %s',
    async (startsOn) => {
      const { app } = createApp();
      const cookie = await login(app);

      const response = await app.request('/api/cms/departures', {
        method: 'POST',
        headers: { cookie, 'content-type': 'application/json' },
        body: JSON.stringify({ tourId: document.id, startsOn }),
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: 'invalid_starts_on' });
    },
  );

  it('returns 409 for a duplicate active departure', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const request = () =>
      app.request('/api/cms/departures', {
        method: 'POST',
        headers: { cookie, 'content-type': 'application/json' },
        body: JSON.stringify({ tourId: document.id, startsOn: '2031-01-12' }),
      });
    expect((await request()).status).toBe(201);

    const duplicate = await request();

    expect(duplicate.status).toBe(409);
    await expect(duplicate.json()).resolves.toEqual({ error: 'departure_duplicate' });
  });

  it('returns 400 when the tour is incomplete', async () => {
    const { app } = createApp();
    const cookie = await login(app);

    const response = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        tourId: incompleteDocument.id,
        startsOn: '2031-01-13',
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'tour_not_ready' });
  });

  it('allows an editor to create a departure', async () => {
    const { app } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');

    const response = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        tourId: document.id,
        startsOn: '2031-01-14',
        seats: 12,
      }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      startsOn: '2031-01-14',
      seats: 12,
      status: 'open',
    });
  });

  it('updates a departure to planned with optimistic versioning', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-01-15' }),
    });
    const departure = (await created.json()) as { id: string };

    const response = await app.request(`/api/cms/departures/${departure.id}`, {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ version: 1, status: 'planned' }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'planned', version: 2 });
  });

  it.each(['2031-1-2', '2031-02-30'])(
    'returns invalid_starts_on when updating startsOn to %s',
    async (startsOn) => {
      const { app } = createApp();
      const cookie = await login(app);
      const created = await app.request('/api/cms/departures', {
        method: 'POST',
        headers: { cookie, 'content-type': 'application/json' },
        body: JSON.stringify({ tourId: document.id, startsOn: '2031-01-16' }),
      });
      const departure = (await created.json()) as { id: string };

      const response = await app.request(`/api/cms/departures/${departure.id}`, {
        method: 'PUT',
        headers: { cookie, 'content-type': 'application/json' },
        body: JSON.stringify({ version: 1, startsOn }),
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: 'invalid_starts_on' });
    },
  );

  it('rejects completed as an editable status', async () => {
    const { app } = createApp();
    const cookie = await login(app);

    const response = await app.request(`/api/cms/departures/${randomUUID()}`, {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ version: 1, status: 'completed' }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'invalid_body' });
  });

  it('deletes an unpublished departure', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-01-17' }),
    });
    const departure = (await created.json()) as { id: string };

    const response = await app.request(`/api/cms/departures/${departure.id}`, {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(response.status).toBe(204);

    const listed = await app.request('/api/cms/departures?from=2031-01-17&to=2031-01-17', {
      headers: { cookie },
    });
    const body = (await listed.json()) as { departures: Array<{ id: string }> };
    expect(body.departures.map((item) => item.id)).not.toContain(departure.id);
  });

  it('returns not_found when deleting a missing departure', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request(`/api/cms/departures/${randomUUID()}`, {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'not_found' });
  });
});

describe('CMS publish flags and inbox', () => {
  it('returns stored publish flags for an editor and effective flags for admin', async () => {
    const { app } = createApp();
    const editorCookie = await login(app, editorLogin, 'editor-pass');
    const editorMe = await app.request('/api/cms/me', { headers: { cookie: editorCookie } });
    await expect(editorMe.json()).resolves.toEqual({
      login: editorLogin,
      role: 'editor',
      canPublishTours: false,
      canPublishSchedule: false,
    });

    const adminCookie = await login(app);
    const patched = await app.request(`/api/cms/users/${editorLogin}`, {
      method: 'PUT',
      headers: { cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ canPublishTours: true, canPublishSchedule: true }),
    });
    expect(patched.status).toBe(200);
    const listed = (await patched.json()) as {
      users: Array<{ login: string; canPublishTours: boolean; canPublishSchedule: boolean }>;
    };
    expect(listed.users.find((user) => user.login === editorLogin)).toMatchObject({
      canPublishTours: true,
      canPublishSchedule: true,
    });
  });

  it('lets an editor submit ready unpublished work and drops a tour that later is not ready', async () => {
    const { app, store } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: unpublishedReady.id, startsOn: '2031-08-20' }),
    });
    expect(created.status).toBe(201);
    const departure = (await created.json()) as { id: string };

    const forbidden = await app.request('/api/cms/tours/winter-2/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: 1 }),
    });
    expect(forbidden.status).toBe(403);

    const submitted = await app.request('/api/cms/publish-queue/submit', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(submitted.status).toBe(200);

    const queue = await app.request('/api/cms/publish-queue', { headers: { cookie } });
    expect(queue.status).toBe(200);
    const queued = (await queue.json()) as {
      items: Array<{ kind: string; id: string; tourId: string }>;
    };
    expect(queued.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'tour', id: 'winter-2', tourId: 'winter-2' }),
        expect.objectContaining({ kind: 'departure', id: departure.id, tourId: 'winter-2' }),
      ]),
    );

    const stripped = await app.request('/api/cms/tours/winter-2', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'Старый текст',
          descriptionAside: '',
          prefaceAssetId: 'preface',
          included: unpublishedReady.included,
          program: unpublishedReady.program,
        },
      }),
    });
    expect(stripped.status).toBe(200);

    const after = await app.request('/api/cms/publish-queue', { headers: { cookie } });
    const afterBody = (await after.json()) as { items: Array<{ kind: string; id: string; ready?: boolean }> };
    expect(afterBody.items.some((item) => item.kind === 'tour' && item.id === 'winter-2')).toBe(true);
    expect(afterBody.items.some((item) => item.id === departure.id)).toBe(true);
    expect(afterBody.items.some((item) => item.kind === 'tour' && item.id === 'winter-2' && item.ready === false)).toBe(
      true,
    );
    expect(await store.getJson(cmsDraftMetaKey('winter-2'))).toMatchObject({
      rev: 2,
      submittedForPublishAt: expect.any(String),
    });
  });

  it('queues a hidden status change for a published tour', async () => {
    const { app } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');
    const saved = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: document.description,
          descriptionAside: document.descriptionAside,
          prefaceAssetId: document.prefaceAssetId,
          included: document.included,
          program: document.program,
        },
        status: 'hidden',
      }),
    });
    expect(saved.status).toBe(200);

    const submitted = await app.request('/api/cms/publish-queue/submit', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourIds: ['winter-1'] }),
    });
    expect(submitted.status).toBe(200);

    const queue = await app.request('/api/cms/publish-queue', { headers: { cookie } });
    const body = (await queue.json()) as { items: Array<{ id: string; kind: string }> };
    expect(body.items).toContainEqual(expect.objectContaining({ id: 'winter-1', kind: 'tour' }));
  });

  it('queues unpublished tour drafts without a separate submit', async () => {
    const { app } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');
    const queue = await app.request('/api/cms/publish-queue', { headers: { cookie } });
    const body = (await queue.json()) as { items: Array<{ id: string; kind: string }> };
    expect(body.items).toContainEqual(expect.objectContaining({ id: 'winter-2', kind: 'tour' }));
    expect(body.items.some((item) => item.id === 'winter-1')).toBe(false);
  });

  it('queues a published tour after draft save without a separate submit', async () => {
    const { app } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');
    const saved = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          price: '9 000 ₽',
          description: document.description,
          descriptionAside: document.descriptionAside,
          prefaceAssetId: document.prefaceAssetId,
          included: document.included,
          program: document.program,
        },
      }),
    });
    expect(saved.status).toBe(200);

    const queue = await app.request('/api/cms/publish-queue', { headers: { cookie } });
    const body = (await queue.json()) as { items: Array<{ id: string; kind: string }> };
    expect(body.items).toContainEqual(expect.objectContaining({ id: 'winter-1', kind: 'tour' }));
  });

  it('queues a new departure after create without a separate submit', async () => {
    const { app } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: unpublishedReady.id, startsOn: '2031-08-22' }),
    });
    expect(created.status).toBe(201);
    const departure = (await created.json()) as { id: string };

    const queue = await app.request('/api/cms/publish-queue', { headers: { cookie } });
    const body = (await queue.json()) as { items: Array<{ id: string; kind: string }> };
    expect(body.items).toContainEqual(expect.objectContaining({ id: departure.id, kind: 'departure' }));
  });

  it('lets a publisher return a submitted tour with a reason', async () => {
    const { app, store } = createApp();
    const editorCookie = await login(app, editorLogin, 'editor-pass');
    const submitted = await app.request('/api/cms/publish-queue/submit', {
      method: 'POST',
      headers: { cookie: editorCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourIds: ['winter-2'] }),
    });
    expect(submitted.status).toBe(200);

    const editorReturn = await app.request('/api/cms/publish-queue/return', {
      method: 'POST',
      headers: { cookie: editorCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'Дополнить программу', tourIds: ['winter-2'] }),
    });
    expect(editorReturn.status).toBe(403);

    const adminCookie = await login(app);
    const returned = await app.request('/api/cms/publish-queue/return', {
      method: 'POST',
      headers: { cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'Дополнить программу', tourIds: ['winter-2'] }),
    });
    expect(returned.status).toBe(200);
    expect(await store.getJson(cmsDraftMetaKey('winter-2'))).toMatchObject({
      submittedForPublishAt: null,
      returnReason: 'Дополнить программу',
    });
    const afterReturn = await app.request('/api/cms/publish-queue', { headers: { cookie: adminCookie } });
    const afterReturnBody = (await afterReturn.json()) as { items: Array<{ id: string; kind: string }> };
    expect(afterReturnBody.items.some((item) => item.id === 'winter-2')).toBe(false);
  });

  it('keeps a returned tour out of the queue after a later draft save', async () => {
    const { app, store } = createApp();
    const editorCookie = await login(app, editorLogin, 'editor-pass');
    const adminCookie = await login(app);
    await app.request('/api/cms/publish-queue/return', {
      method: 'POST',
      headers: { cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'Дополнить программу', tourIds: ['winter-2'] }),
    });
    const saved = await app.request('/api/cms/tours/winter-2', {
      method: 'PUT',
      headers: { cookie: editorCookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: unpublishedReady.description,
          descriptionAside: unpublishedReady.descriptionAside,
          prefaceAssetId: unpublishedReady.prefaceAssetId,
          included: unpublishedReady.included,
          program: unpublishedReady.program,
        },
      }),
    });
    expect(saved.status).toBe(200);
    expect(await store.getJson(cmsDraftMetaKey('winter-2'))).toMatchObject({
      submittedForPublishAt: null,
      returnReason: 'Дополнить программу',
    });
    const queue = await app.request('/api/cms/publish-queue', { headers: { cookie: adminCookie } });
    const body = (await queue.json()) as { items: Array<{ id: string }> };
    expect(body.items.some((item) => item.id === 'winter-2')).toBe(false);
  });

  it('lets an editor with canPublishTours publish a tour', async () => {
    const { app, store } = createApp();
    await authRepository.updateUser(editorUserId, { canPublishTours: true });
    const cookie = await login(app, editorLogin, 'editor-pass');
    const published = await app.request('/api/cms/tours/winter-2/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: 1 }),
    });
    expect(published.status).toBe(200);
    const catalog = (await store.getJson(CMS_PUBLISHED_CATALOG_KEY)) as {
      tours: Array<{ id: string }>;
    };
    expect(catalog.tours.some((tour) => tour.id === 'winter-2')).toBe(true);
  });

  it('blocks schedule publish when the tour is not in the public catalog', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: unpublishedReady.id, startsOn: '2031-08-21' }),
    });
    const departure = (await created.json()) as { id: string };

    const blocked = await app.request('/api/cms/departures/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ ids: [departure.id] }),
    });
    expect(blocked.status).toBe(400);
    await expect(blocked.json()).resolves.toEqual({ error: 'tour_not_published' });
  });

  it('writes guest schedule without planned or cancelled dates', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    const open = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-08-22' }),
    });
    const planned = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-08-23' }),
    });
    const cancelled = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-08-24' }),
    });
    const openBody = (await open.json()) as { id: string };
    const plannedBody = (await planned.json()) as { id: string };
    const cancelledBody = (await cancelled.json()) as { id: string };
    await app.request(`/api/cms/departures/${plannedBody.id}`, {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ version: 1, status: 'planned' }),
    });
    await app.request(`/api/cms/departures/${cancelledBody.id}`, {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ version: 1, status: 'cancelled' }),
    });

    const published = await app.request('/api/cms/departures/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ ids: [openBody.id, plannedBody.id, cancelledBody.id] }),
    });
    expect(published.status).toBe(200);

    const payload = (await store.getJson(CMS_PUBLISHED_SCHEDULE_KEY)) as {
      schemaVersion: number;
      events: Array<{ date: string; status: string }>;
    };
    expect(payload.schemaVersion).toBe(1);
    expect(payload.events.map((event) => event.status)).toEqual(['open']);
    expect(payload.events[0]?.date).toBe('2031-08-22');

    const toursList = (await store.getJson(CMS_PUBLISHED_TOURS_LIST_KEY)) as {
      schemaVersion: number;
      tours: Array<{ id: string; publicationStatus: string }>;
    };
    expect(toursList.schemaVersion).toBe(1);
    expect(toursList.tours).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'winter-1', publicationStatus: 'active' }),
      ]),
    );
  });

  it('does not put an unpublished departure on the guest calendar when a tour is published', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-09-01' }),
    });
    expect(created.status).toBe(201);

    const published = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: 1 }),
    });
    expect(published.status).toBe(200);

    const schedule = (await store.getJson(CMS_PUBLISHED_SCHEDULE_KEY)) as {
      events: Array<{ date: string; tourId: string }>;
    };
    expect(schedule.events.some((event) => event.date === '2031-09-01')).toBe(false);
  });

  it('rejects queue publish when the tour rev is stale', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const saved = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          price: '9 000 ₽',
          description: document.description,
          descriptionAside: document.descriptionAside,
          prefaceAssetId: document.prefaceAssetId,
          included: document.included,
          program: document.program,
        },
      }),
    });
    expect(saved.status).toBe(200);

    const published = await app.request('/api/cms/publish-queue/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourIds: ['winter-1'], tourRevs: { 'winter-1': 1 } }),
    });
    expect(published.status).toBe(409);
    await expect(published.json()).resolves.toMatchObject({ error: 'rev_conflict', tourId: 'winter-1' });
  });

  it('forbids an editor without canPublishSchedule from publishing dates', async () => {
    const { app } = createApp();
    const cookie = await login(app, editorLogin, 'editor-pass');
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-08-25' }),
    });
    const departure = (await created.json()) as { id: string };
    const forbidden = await app.request('/api/cms/departures/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ ids: [departure.id] }),
    });
    expect(forbidden.status).toBe(403);
  });

  it('lists publishedStatus from the live catalog, not the draft hide', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const hidden = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: document.description,
          descriptionAside: document.descriptionAside,
          prefaceAssetId: document.prefaceAssetId,
          included: document.included,
          program: document.program,
        },
        status: 'hidden',
      }),
    });
    expect(hidden.status).toBe(200);
    const list = await app.request('/api/cms/tours', { headers: { cookie } });
    const body = (await list.json()) as {
      tours: Array<{ id: string; status: string; publishedStatus: string | null }>;
    };
    expect(body.tours).toContainEqual(
      expect.objectContaining({
        id: 'winter-1',
        status: 'hidden',
        publishedStatus: 'active',
      }),
    );
  });

  it('lists a catalog overlay tour as published even without a per-tour snapshot', async () => {
    const { app, store } = createApp();
    const overlayTour = {
      ...document,
      id: 'summer-8',
      slug: 'poluostrov-krabbe',
      title: 'Полуостров Краббе',
      status: 'active' as const,
    };
    await store.putJson(cmsDraftDocumentKey('summer-8'), { ...overlayTour, status: 'hidden' });
    await store.putJson(cmsDraftMetaKey('summer-8'), {
      rev: 1,
      updatedAt: '2026-08-14T00:00:00.000Z',
      editor: 'cms:export',
    });
    await store.putJson(CMS_DRAFT_INDEX_KEY, { schemaVersion: 1, tourIds: ['winter-2', 'summer-8'] });
    await store.putJson(CMS_PUBLISHED_CATALOG_KEY, {
      schemaVersion: 1,
      tours: [document, overlayTour],
    });
    const cookie = await login(app);

    const list = await app.request('/api/cms/tours', { headers: { cookie } });
    const body = (await list.json()) as {
      tours: Array<{ id: string; status: string; published: boolean; publishedStatus: string | null }>;
    };
    expect(body.tours).toContainEqual(
      expect.objectContaining({
        id: 'summer-8',
        status: 'hidden',
        published: true,
        publishedStatus: 'active',
      }),
    );

    const one = await app.request('/api/cms/tours/summer-8', { headers: { cookie } });
    const detail = (await one.json()) as {
      published: boolean;
      publishedStatus: string | null;
      document: { status: string };
    };
    expect(detail).toMatchObject({
      published: true,
      publishedStatus: 'active',
      document: { status: 'hidden' },
    });

    const queue = await app.request('/api/cms/publish-queue', { headers: { cookie } });
    const queued = (await queue.json()) as {
      items: Array<{ id: string; summary: string; publishedStatus: string | null }>;
    };
    expect(queued.items).toContainEqual(
      expect.objectContaining({
        id: 'summer-8',
        summary: 'tour_draft',
        publishedStatus: 'active',
      }),
    );
  });

  it('refuses to publish a hidden tour until future departures are confirmed, then deletes them', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-09-01' }),
    });
    expect(created.status).toBe(201);
    const departure = (await created.json()) as { id: string };

    const hidden = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: document.description,
          descriptionAside: document.descriptionAside,
          prefaceAssetId: document.prefaceAssetId,
          included: document.included,
          program: document.program,
        },
        status: 'hidden',
      }),
    });
    expect(hidden.status).toBe(200);
    const saved = (await hidden.json()) as { meta: { rev: number } };

    const blocked = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: saved.meta.rev }),
    });
    expect(blocked.status).toBe(400);
    await expect(blocked.json()).resolves.toMatchObject({ error: 'confirm_delete_future_departures' });

    const published = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: saved.meta.rev,
        confirmDeleteFutureDepartures: true,
      }),
    });
    expect(published.status).toBe(200);

    const toursAfterHide = await app.request('/api/cms/tours', { headers: { cookie } });
    const listedTours = (await toursAfterHide.json()) as {
      tours: Array<{ id: string; status: string; published: boolean; publishedStatus: string | null }>;
    };
    expect(listedTours.tours).toContainEqual(
      expect.objectContaining({
        id: 'winter-1',
        status: 'hidden',
        published: true,
        publishedStatus: 'hidden',
      }),
    );
    const catalog = (await store.getJson(CMS_PUBLISHED_CATALOG_KEY)) as {
      tours: Array<{ id: string; status: string }>;
    };
    expect(catalog.tours).toContainEqual(expect.objectContaining({ id: 'winter-1', status: 'hidden' }));
    const guestList = (await store.getJson(CMS_PUBLISHED_TOURS_LIST_KEY)) as {
      tours: Array<{ id: string }>;
    };
    expect(guestList.tours.some((tour) => tour.id === 'winter-1')).toBe(false);

    const listed = await app.request(
      '/api/cms/departures?from=2031-09-01&to=2031-09-01&includeHistory=true',
      { headers: { cookie } },
    );
    const body = (await listed.json()) as { departures: Array<{ id: string }> };
    expect(body.departures.some((item) => item.id === departure.id)).toBe(false);
  });

  it('keeps a published past date on the guest calendar after the tour is hidden', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2026-08-10' }),
    });
    expect(created.status).toBe(201);
    const departure = (await created.json()) as { id: string; version: number };

    await app.request('/api/cms/departures?from=2026-08-10&to=2026-08-10&includeHistory=true', {
      headers: { cookie },
    });
    const publishedDates = await app.request('/api/cms/departures/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ ids: [departure.id] }),
    });
    expect(publishedDates.status).toBe(200);

    const hidden = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: document.description,
          descriptionAside: document.descriptionAside,
          prefaceAssetId: document.prefaceAssetId,
          included: document.included,
          program: document.program,
        },
        status: 'hidden',
      }),
    });
    expect(hidden.status).toBe(200);
    const saved = (await hidden.json()) as { meta: { rev: number } };
    const published = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: saved.meta.rev }),
    });
    expect(published.status).toBe(200);

    const toursList = (await store.getJson(CMS_PUBLISHED_TOURS_LIST_KEY)) as {
      tours: Array<{ id: string }>;
    };
    expect(toursList.tours.some((tour) => tour.id === 'winter-1')).toBe(false);
    const schedule = (await store.getJson(CMS_PUBLISHED_SCHEDULE_KEY)) as {
      events: Array<{ date: string; tourId: string; status: string }>;
    };
    expect(schedule.events).toContainEqual(
      expect.objectContaining({
        date: '2026-08-10',
        tourId: 'winter-1',
        status: 'completed',
      }),
    );
    const guestCalendar = mergeTourDataToSchedulePayload(toursList, schedule);
    expect(guestCalendar.events).toContainEqual(
      expect.objectContaining({
        date: '2026-08-10',
        tourId: 'winter-1',
        status: 'completed',
      }),
    );
    expect(guestCalendar.catalogPublicationStatuses['winter-1']).toBe('hidden');
  });

  it('does not silently skip a blocked tour in the publish queue', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const published = await app.request('/api/cms/publish-queue/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourIds: ['winter-incomplete'] }),
    });
    expect(published.status).toBe(400);
    await expect(published.json()).resolves.toMatchObject({ error: 'tour_not_ready' });
  });

  it('publishes a hide of an incomplete live tour from the queue', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    await store.putJson(cmsDraftDocumentKey('winter-1'), {
      ...document,
      status: 'hidden',
      subtitle: '',
    });

    const published = await app.request('/api/cms/publish-queue/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourIds: ['winter-1'] }),
    });
    expect(published.status).toBe(200);

    const guestList = (await store.getJson(CMS_PUBLISHED_TOURS_LIST_KEY)) as {
      tours: Array<{ id: string }>;
    };
    expect(guestList.tours.some((tour) => tour.id === 'winter-1')).toBe(false);
    const catalog = (await store.getJson(CMS_PUBLISHED_CATALOG_KEY)) as {
      tours: Array<{ id: string; status: string; subtitle: string }>;
    };
    expect(catalog.tours).toContainEqual(
      expect.objectContaining({ id: 'winter-1', status: 'hidden', subtitle: 'Зима' }),
    );
  });

  it('still publishes a live hide when the same queue batch contains an incomplete tour', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    await store.putJson(cmsDraftDocumentKey('winter-1'), {
      ...document,
      status: 'hidden',
      subtitle: '',
    });

    const published = await app.request('/api/cms/publish-queue/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourIds: ['winter-incomplete', 'winter-1'] }),
    });
    expect(published.status).toBe(200);

    const guestList = (await store.getJson(CMS_PUBLISHED_TOURS_LIST_KEY)) as {
      tours: Array<{ id: string }>;
    };
    expect(guestList.tours.some((tour) => tour.id === 'winter-1')).toBe(false);
    const catalog = (await store.getJson(CMS_PUBLISHED_CATALOG_KEY)) as {
      tours: Array<{ id: string }>;
    };
    expect(catalog.tours.some((tour) => tour.id === 'winter-incomplete')).toBe(false);
  });

  it('publishes a hide of an incomplete live tour from the tour editor', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    await store.putJson(cmsDraftDocumentKey('winter-1'), {
      ...document,
      status: 'hidden',
      subtitle: '',
    });

    const published = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: 1 }),
    });
    expect(published.status).toBe(200);
    const guestList = (await store.getJson(CMS_PUBLISHED_TOURS_LIST_KEY)) as {
      tours: Array<{ id: string }>;
    };
    expect(guestList.tours.some((tour) => tour.id === 'winter-1')).toBe(false);
  });

  it('publishes every eligible departure, not only the current month', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-12-15' }),
    });
    expect(created.status).toBe(201);
    const published = await app.request('/api/cms/departures/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ allEligible: true }),
    });
    expect(published.status).toBe(200);
  });

  it('lets a live tour keep new dates while its draft is incomplete', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    await store.putJson(cmsDraftDocumentKey('winter-1'), {
      ...document,
      subtitle: '',
    });

    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-11-02' }),
    });
    expect(created.status).toBe(201);
  });

  it('rejects deleting a date that already has a guest snapshot', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-11-03' }),
    });
    const departure = (await created.json()) as { id: string };
    expect(
      (
        await app.request('/api/cms/departures/publish', {
          method: 'POST',
          headers: { cookie, 'content-type': 'application/json' },
          body: JSON.stringify({ ids: [departure.id] }),
        })
      ).status,
    ).toBe(200);

    const deleted = await app.request(`/api/cms/departures/${departure.id}`, {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(deleted.status).toBe(409);
    await expect(deleted.json()).resolves.toEqual({ error: 'departure_published' });
  });

  it('takes a cancelled published date off the guest calendar after schedule publish', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-11-04' }),
    });
    const departure = (await created.json()) as { id: string; version: number };
    expect(
      (
        await app.request('/api/cms/departures/publish', {
          method: 'POST',
          headers: { cookie, 'content-type': 'application/json' },
          body: JSON.stringify({ ids: [departure.id] }),
        })
      ).status,
    ).toBe(200);

    const cancelled = await app.request(`/api/cms/departures/${departure.id}`, {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ version: departure.version, status: 'cancelled' }),
    });
    expect(cancelled.status).toBe(200);

    const before = (await store.getJson(CMS_PUBLISHED_SCHEDULE_KEY)) as {
      events: Array<{ date: string; tourId: string }>;
    };
    expect(before.events).toContainEqual(
      expect.objectContaining({ date: '2031-11-04', tourId: 'winter-1' }),
    );

    const queue = await app.request('/api/cms/publish-queue', { headers: { cookie } });
    const queueBody = (await queue.json()) as { items: Array<{ id: string; kind: string }> };
    expect(queueBody.items).toContainEqual(expect.objectContaining({ id: departure.id, kind: 'departure' }));

    expect(
      (
        await app.request('/api/cms/departures/publish', {
          method: 'POST',
          headers: { cookie, 'content-type': 'application/json' },
          body: JSON.stringify({ ids: [departure.id] }),
        })
      ).status,
    ).toBe(200);

    const after = (await store.getJson(CMS_PUBLISHED_SCHEDULE_KEY)) as {
      events: Array<{ date: string }>;
    };
    expect(after.events.some((event) => event.date === '2031-11-04')).toBe(false);
  });

  it('does not republish dates that already match the snapshot when publishing all eligible', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    const first = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-11-05' }),
    });
    const publishedDeparture = (await first.json()) as { id: string };
    expect(
      (
        await app.request('/api/cms/departures/publish', {
          method: 'POST',
          headers: { cookie, 'content-type': 'application/json' },
          body: JSON.stringify({ ids: [publishedDeparture.id] }),
        })
      ).status,
    ).toBe(200);
    const listed = await app.request(
      '/api/cms/departures?from=2031-11-05&to=2031-11-05&includeHistory=true',
      { headers: { cookie } },
    );
    const listedBody = (await listed.json()) as {
      departures: Array<{ id: string; publishedAt: string | null }>;
    };
    const publishedAt = listedBody.departures[0]?.publishedAt;
    expect(publishedAt).toEqual(expect.any(String));

    const second = await app.request('/api/cms/departures', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ tourId: document.id, startsOn: '2031-11-06' }),
    });
    const dirty = (await second.json()) as { id: string };
    expect(
      (
        await app.request('/api/cms/departures/publish', {
          method: 'POST',
          headers: { cookie, 'content-type': 'application/json' },
          body: JSON.stringify({ allEligible: true }),
        })
      ).status,
    ).toBe(200);

    const afterListed = await app.request(
      '/api/cms/departures?from=2031-11-05&to=2031-11-06&includeHistory=true',
      { headers: { cookie } },
    );
    const afterBody = (await afterListed.json()) as {
      departures: Array<{ id: string; publishedAt: string | null }>;
    };
    expect(afterBody.departures.find((item) => item.id === publishedDeparture.id)?.publishedAt).toBe(
      publishedAt,
    );
    expect(afterBody.departures.find((item) => item.id === dirty.id)?.publishedAt).toEqual(
      expect.any(String),
    );
    const schedule = (await store.getJson(CMS_PUBLISHED_SCHEDULE_KEY)) as {
      events: Array<{ date: string }>;
    };
    expect(schedule.events.map((event) => event.date)).toEqual(
      expect.arrayContaining(['2031-11-05', '2031-11-06']),
    );
  });
});
