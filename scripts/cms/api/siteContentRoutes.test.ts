/** @vitest-environment node */
import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import { seedSiteContentDocuments } from '../../../src/cms/siteContentSeed.ts';
import { siteContentDraftKey, siteContentPublishedKey } from '../../../src/cms/siteContentPackageKeys.ts';
import type { CmsApiEnv } from './env.ts';
import type { CmsSession } from './session.ts';
import { registerSiteContentRoutes } from './siteContentRoutes.ts';
import { createMemoryJsonStore } from './store.ts';

vi.mock('heic-convert', () => ({
  default: async () => new Uint8Array([255, 216, 255, 224]),
}));

const env = {
  s3: {
    bucket: 'vkraynosti-cms-dev',
    endpoint: 'https://s3.twcstorage.ru',
    publicBaseUrl: 'https://ypnmfvotln.cdn.twcstorage.ru',
  },
} as CmsApiEnv;

function createSiteApp(session: CmsSession) {
  const app = new Hono<{ Variables: { session: CmsSession } }>();
  app.use('*', async (c, next) => {
    c.set('session', session);
    await next();
  });
  const store = createMemoryJsonStore();
  registerSiteContentRoutes(app, { store, env });
  return { app, store };
}

const session = (canEditSiteContent: boolean): CmsSession => ({
  sub: 'editor',
  role: 'editor',
  exp: Date.now() + 60_000,
  canPublishTours: false,
  canPublishSchedule: false,
  canEditSiteContent,
});

describe('site content routes', () => {
  it('denies an editor without the site content privilege', async () => {
    const { app } = createSiteApp(session(false));
    const response = await app.request('/api/cms/site-content/team');
    expect(response.status).toBe(403);
  });

  it('keeps draft and published documents independent by kind', async () => {
    const { app, store } = createSiteApp(session(true));
    const getTeam = await app.request('/api/cms/site-content/team');
    const teamBody = (await getTeam.json()) as { document: ReturnType<typeof seedSiteContentDocuments>['team']; meta: { rev: number } };
    const saveTeam = await app.request('/api/cms/site-content/team', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: teamBody.meta.rev,
        document: { ...teamBody.document, members: [] },
      }),
    });
    expect(saveTeam.status).toBe(200);
    const publishTeam = await app.request('/api/cms/site-content/team/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rev: teamBody.meta.rev + 1 }),
    });
    expect(publishTeam.status).toBe(200);
    expect(await store.getJson(siteContentPublishedKey('team'))).toMatchObject({ kind: 'team', members: [] });
    expect(await store.getJson(siteContentPublishedKey('contacts'))).toBeNull();
    expect(await store.getJson(siteContentDraftKey('contacts'))).toBeNull();
  });

  it('persists modal mode in the draft and reports the change', async () => {
    const { app } = createSiteApp(session(true));
    const initial = await app.request('/api/cms/site-content/modal');
    const body = (await initial.json()) as { document: ReturnType<typeof seedSiteContentDocuments>['modal']; meta: { rev: number } };
    const saved = await app.request('/api/cms/site-content/modal', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rev: body.meta.rev, document: { ...body.document, requestFormEnabled: false } }),
    });
    expect(saved.status).toBe(200);
    const changes = await app.request('/api/cms/site-content-changes');
    expect(changes.status).toBe(200);
    expect(await changes.json()).toEqual(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            kind: 'modal',
            changes: expect.arrayContaining([
              expect.objectContaining({ label: 'Режим CTA', to: 'контакты' }),
            ]),
          }),
        ]),
      }),
    );
    const reloaded = await app.request('/api/cms/site-content/modal');
    expect((await reloaded.json()).document.requestFormEnabled).toBe(false);
  });

  it('stores an uploaded team photo at media/site-content/team/{id}.jpg on the public CMS origin', async () => {
    const { app, store } = createSiteApp(session(true));
    const form = new FormData();
    form.set('file', new File([new Uint8Array([1, 2, 3])], 'elena.jpg', { type: 'image/jpeg' }));
    const response = await app.request('/api/cms/site-content/team/assets', { method: 'POST', body: form });
    expect(response.status).toBe(201);
    const body = (await response.json()) as { asset: { assetId: string; url: string; mimeType: string } };
    expect(body.asset.mimeType).toBe('image/jpeg');
    expect(body.asset.url).toBe(
      `https://ypnmfvotln.cdn.twcstorage.ru/media/site-content/team/${body.asset.assetId}.jpg`,
    );
    expect(body.asset.url).toContain('cdn.twcstorage.ru');
    const stored = await store.getBytes(`media/site-content/team/${body.asset.assetId}.jpg`);
    expect(stored?.body).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('converts an uploaded HEIC team photo to jpeg before storing', async () => {
    const { app, store } = createSiteApp(session(true));
    const form = new FormData();
    form.set('file', new File([new Uint8Array([1, 2, 3])], 'elena.heic', { type: 'image/heic' }));
    const response = await app.request('/api/cms/site-content/team/assets', { method: 'POST', body: form });
    expect(response.status).toBe(201);
    const body = (await response.json()) as { asset: { assetId: string; url: string; mimeType: string } };
    expect(body.asset.mimeType).toBe('image/jpeg');
    expect(body.asset.url).toBe(
      `https://ypnmfvotln.cdn.twcstorage.ru/media/site-content/team/${body.asset.assetId}.jpg`,
    );
    const stored = await store.getBytes(`media/site-content/team/${body.asset.assetId}.jpg`);
    expect(stored?.body).toEqual(new Uint8Array([255, 216, 255, 224]));
  });
});
