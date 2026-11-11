/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
} from '../../../src/cms/cmsPackageKeys.ts';
import { SITE_CONTENT_KINDS } from '../../../src/cms/siteContentDocument.ts';
import { siteContentPublishedKey } from '../../../src/cms/siteContentPackageKeys.ts';
import { createDefaultSiteSeoDocument } from '../../../src/cms/siteSeoDocument.ts';
import { createCmsApiApp } from './app.ts';
import type { CmsApiEnv } from './env.ts';
import type { AuthRepository } from './auth/authRepository.ts';
import type { DepartureRepository } from './schedule/departureRepository.ts';
import { createMemoryJsonStore } from './store.ts';

function createApp(overrides: Partial<CmsApiEnv> = {}, includeRequiredData = true) {
  const store = createMemoryJsonStore({
    [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [] },
    ...(includeRequiredData ? {
      [CMS_PUBLISHED_TOURS_LIST_KEY]: { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', tours: [] },
      [CMS_PUBLISHED_SCHEDULE_KEY]: { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', events: [] },
      ...Object.fromEntries(SITE_CONTENT_KINDS.map((kind) => [
        siteContentPublishedKey(kind), kind === 'seo' ? createDefaultSiteSeoDocument() : null,
      ])),
    } : {}),
  });
  const env: CmsApiEnv = {
    port: 3000,
    authSecret: 'test-auth-secret-16',
    deploySecret: 'test-deploy-secret-16',
    cookieSecure: false,
    cookieSameSite: 'Lax',
    crmInboundSecret: '',
    users: [{ login: 'test-admin', password: 'password', role: 'admin' }],
    storeKind: 'filesystem',
    localStoreDir: 'tmp/cms-test',
    s3: {
      bucket: 'test', endpoint: 'https://s3.example', region: 'ru-1',
      accessKey: 'key', secretKey: 'secret', forcePathStyle: true, publicBaseUrl: 'https://cdn.example',
    },
    ...overrides,
  };
  const authRepository = {
    async listUsers() { return [{ login: 'test-admin' }]; },
  } as unknown as AuthRepository;
  const departureRepository = {} as DepartureRepository;
  return createCmsApiApp({ env, store, authRepository, departureRepository });
}

describe('internal CMS release bake endpoint', () => {
  it('requires a configured matching deploy secret', async () => {
    const app = createApp();
    const missing = await app.request('/api/cms/internal/bake');
    const wrong = await app.request('/api/cms/internal/bake', {
      headers: { 'x-cms-deploy-secret': 'wrong-secret' },
    });

    expect(missing.status).toBe(401);
    expect(wrong.status).toBe(403);
  });

  it('returns the complete identified release while retaining legacy top-level fields', async () => {
    const app = createApp();
    const response = await app.request('/api/cms/internal/bake', {
      headers: { 'x-cms-deploy-secret': 'test-deploy-secret-16' },
    });
    const body = await response.json() as {
      payload?: { siteContent?: { seo?: { pages?: Array<{ key: string }> } } };
      manifest?: { releaseId?: string; sha256?: string };
      tours?: unknown;
    };

    expect(response.status).toBe(200);
    expect(body.manifest?.releaseId).toMatch(/^seo-[a-f0-9]{24}$/);
    expect(body.manifest?.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(body.payload?.siteContent?.seo?.pages?.map(({ key }) => key)).toContain('privacy');
    expect(body.tours).toBeDefined();
  });

  it('returns unavailable rather than baking incomplete data', async () => {
    const app = createApp({}, false);
    const response = await app.request('/api/cms/internal/bake', {
      headers: { 'x-cms-deploy-secret': 'test-deploy-secret-16' },
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'bake_snapshot_unavailable' });
  });

  it('disables the endpoint when no deploy secret is configured', async () => {
    const app = createApp({ deploySecret: '' });
    const response = await app.request('/api/cms/internal/bake', {
      headers: { 'x-cms-deploy-secret': 'test-deploy-secret-16' },
    });

    expect(response.status).toBe(503);
  });
});
