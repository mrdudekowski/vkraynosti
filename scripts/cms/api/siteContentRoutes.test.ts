/** @vitest-environment node */
import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { seedSiteContentDocuments } from '../../../src/cms/siteContentSeed.ts';
import { siteContentDraftKey, siteContentPublishedKey } from '../../../src/cms/siteContentPackageKeys.ts';
import type { CmsApiEnv } from './env.ts';
import type { CmsSession } from './session.ts';
import { registerSiteContentRoutes } from './siteContentRoutes.ts';
import { createMemoryJsonStore } from './store.ts';

const env = {} as CmsApiEnv;

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
});
