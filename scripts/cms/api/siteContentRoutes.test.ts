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
  it('saves, reloads, and publishes the fixed site SEO document with its revision', async () => {
    const { app, store } = createSiteApp(session(true));
    const initial = await app.request('/api/cms/site-content/seo');
    const body = await initial.json() as { document: ReturnType<typeof seedSiteContentDocuments>['seo']; meta: { rev: number } };
    const document = { ...body.document, pages: body.document.pages.map((page) => page.key === 'home'
      ? { ...page, title: 'SEO главной', keywords: ['туры по Приморью'] }
      : page) };
    const saved = await app.request('/api/cms/site-content/seo', {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rev: body.meta.rev, document }),
    });
    expect(saved.status).toBe(200);
    const reloaded = await app.request('/api/cms/site-content/seo');
    expect((await reloaded.json()).document.pages[0]).toMatchObject({ title: 'SEO главной', keywords: ['туры по Приморью'] });
    const publish = await app.request('/api/cms/site-content/seo/publish', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rev: body.meta.rev + 1 }),
    });
    expect(publish.status).toBe(200);
    expect(await store.getJson('published/site-seo/document.json')).toMatchObject({
      pages: expect.arrayContaining([expect.objectContaining({ key: 'home', title: 'SEO главной' })]),
    });
  });
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

  it('keeps a saved request-form modal through reload and publish even when it matches the code seed', async () => {
    const { app, store } = createSiteApp(session(true));
    const initial = await app.request('/api/cms/site-content/modal');
    const body = (await initial.json()) as {
      document: ReturnType<typeof seedSiteContentDocuments>['modal'];
      meta: { rev: number };
    };
    const contacts = await app.request('/api/cms/site-content/modal', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rev: body.meta.rev, document: { ...body.document, requestFormEnabled: false } }),
    });
    const contactsBody = (await contacts.json()) as { meta: { rev: number } };
    const publishedContacts = await app.request('/api/cms/site-content/modal/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rev: contactsBody.meta.rev }),
    });
    expect(publishedContacts.status).toBe(200);
    const publishedContactsBody = (await publishedContacts.json()) as { meta: { rev: number } };

    const requestForm = await app.request('/api/cms/site-content/modal', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: publishedContactsBody.meta.rev,
        document: { ...body.document, requestFormEnabled: true },
      }),
    });
    const requestFormBody = (await requestForm.json()) as {
      document: { requestFormEnabled: boolean };
      meta: { rev: number };
    };
    expect(requestForm.status).toBe(200);
    expect(requestFormBody.document.requestFormEnabled).toBe(true);

    const afterSave = await app.request('/api/cms/site-content/modal');
    expect((await afterSave.json()).document.requestFormEnabled).toBe(true);

    const publish = await app.request('/api/cms/site-content/modal/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rev: requestFormBody.meta.rev }),
    });
    expect(publish.status).toBe(200);
    expect((await publish.json()).document.requestFormEnabled).toBe(true);
    expect(await store.getJson(siteContentPublishedKey('modal'))).toMatchObject({
      requestFormEnabled: true,
    });
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

  it('opens a missing draft from the published document instead of the code seed', async () => {
    const { app, store } = createSiteApp(session(true));
    const seeded = seedSiteContentDocuments().seo;
    const published = {
      ...seeded,
      pages: seeded.pages.map((page) => page.key === 'home' ? { ...page, title: 'Уже на сайте' } : page),
    };
    await store.putJson(siteContentPublishedKey('seo'), published);

    const response = await app.request('/api/cms/site-content/seo');

    expect(response.status).toBe(200);
    const body = await response.json() as { document: { pages: Array<{ key: string; title: string }> } };
    expect(body.document.pages.find((page) => page.key === 'home')?.title).toBe('Уже на сайте');
    expect(await store.getJson(siteContentDraftKey('seo'))).toMatchObject({
      pages: expect.arrayContaining([expect.objectContaining({ key: 'home', title: 'Уже на сайте' })]),
    });
  });

  it('keeps an edited draft when the published document is different', async () => {
    const { app, store } = createSiteApp(session(true));
    const seeded = seedSiteContentDocuments().seo;
    const edited = {
      ...seeded,
      pages: seeded.pages.map((page) => page.key === 'home' ? { ...page, title: 'Черновик редактора' } : page),
    };
    const published = {
      ...seeded,
      pages: seeded.pages.map((page) => page.key === 'home' ? { ...page, title: 'На сайте' } : page),
    };
    await store.putJson(siteContentDraftKey('seo'), edited);
    await store.putJson(siteContentPublishedKey('seo'), published);

    const response = await app.request('/api/cms/site-content/seo');

    const body = await response.json() as { document: { pages: Array<{ key: string; title: string }> } };
    expect(body.document.pages.find((page) => page.key === 'home')?.title).toBe('Черновик редактора');
  });

  it('replaces a draft that is still the code seed when the published document differs', async () => {
    const { app, store } = createSiteApp(session(true));
    const seeded = seedSiteContentDocuments().seo;
    const published = {
      ...seeded,
      pages: seeded.pages.map((page) => page.key === 'home' ? { ...page, title: 'Опубликованный заголовок' } : page),
    };
    await store.putJson(siteContentDraftKey('seo'), seeded);
    await store.putJson(siteContentPublishedKey('seo'), published);

    const response = await app.request('/api/cms/site-content/seo');

    const body = await response.json() as { document: { pages: Array<{ key: string; title: string }> } };
    expect(body.document.pages.find((page) => page.key === 'home')?.title).toBe('Опубликованный заголовок');
  });

  it('publishes one policy document without publishing the others', async () => {
    const { app, store } = createSiteApp(session(true));
    const privacy = await app.request('/api/cms/site-content/policy-personal-data-policy');
    expect(privacy.status).toBe(200);
    const privacyBody = (await privacy.json()) as {
      document: { kind: string; bodyHtml: string; title: string };
      meta: { rev: number };
    };
    expect(privacyBody.document.kind).toBe('policy-personal-data-policy');
    expect(privacyBody.document.bodyHtml).toContain('1. Общие положения');
    expect(privacyBody.document.bodyHtml).not.toContain('40802810300005585906');

    const saved = await app.request('/api/cms/site-content/policy-personal-data-policy', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: privacyBody.meta.rev,
        document: { ...privacyBody.document, bodyHtml: '<h2>1. Общие положения</h2><p>Черновик политики</p>' },
      }),
    });
    expect(saved.status).toBe(200);
    const publishPrivacy = await app.request('/api/cms/site-content/policy-personal-data-policy/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rev: privacyBody.meta.rev + 1 }),
    });
    expect(publishPrivacy.status).toBe(200);
    expect(await store.getJson('published/site-content/policy-personal-data-policy/document.json')).toMatchObject({
      bodyHtml: '<h2>1. Общие положения</h2><p>Черновик политики</p>',
    });
    expect(await store.getJson('published/site-content/policy-personal-data-consent/document.json')).toBeNull();

    const consent = await app.request('/api/cms/site-content/policy-personal-data-consent');
    expect(consent.status).toBe(200);
    const consentBody = (await consent.json()) as { document: { kind: string; bodyHtml: string } };
    expect(consentBody.document.kind).toBe('policy-personal-data-consent');
    expect(consentBody.document.bodyHtml).toBe('');
  });

  it('inherits a footer-uploaded policy PDF into a new policy draft', async () => {
    const { app, store } = createSiteApp(session(true));
    const footer = seedSiteContentDocuments().footer;
    const publishedFooter = {
      ...footer,
      blocks: footer.blocks.map((block) =>
        block.id !== 'legal'
          ? block
          : {
              ...block,
              rows: block.rows.map((row) =>
                row.type === 'pdf' && row.documentId === 'offer-and-safety'
                  ? {
                      ...row,
                      asset: {
                        assetId: 'footer-offer',
                        url: 'https://ypnmfvotln.cdn.twcstorage.ru/media/site-content/footer/footer-offer.pdf',
                        mimeType: 'application/pdf',
                        alt: row.value,
                      },
                    }
                  : row,
              ),
            },
      ),
    };
    await store.putJson(siteContentPublishedKey('footer'), publishedFooter);

    const response = await app.request('/api/cms/site-content/policy-offer-and-safety');
    const body = (await response.json()) as { document: { asset?: { url: string } } };
    expect(body.document.asset?.url).toBe(
      'https://ypnmfvotln.cdn.twcstorage.ru/media/site-content/footer/footer-offer.pdf',
    );
  });

  it('stores an uploaded policy PDF at media/site-content/policy-personal-data-policy/{id}.pdf', async () => {
    const { app, store } = createSiteApp(session(true));
    const form = new FormData();
    form.set('file', new File([new Uint8Array([37, 80, 68, 70])], 'policy.pdf', { type: 'application/pdf' }));
    const response = await app.request('/api/cms/site-content/policy-personal-data-policy/assets', {
      method: 'POST',
      body: form,
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as { asset: { assetId: string; url: string; mimeType: string } };
    expect(body.asset.mimeType).toBe('application/pdf');
    expect(body.asset.url).toBe(
      `https://ypnmfvotln.cdn.twcstorage.ru/media/site-content/policy-personal-data-policy/${body.asset.assetId}.pdf`,
    );
    const stored = await store.getBytes(
      `media/site-content/policy-personal-data-policy/${body.asset.assetId}.pdf`,
    );
    expect(stored?.body).toEqual(new Uint8Array([37, 80, 68, 70]));
  });

  it('rejects site-content assets while storage is open', async () => {
    const app = new Hono<{ Variables: { session: CmsSession } }>();
    app.use('*', async (c, next) => {
      c.set('session', session(true));
      await next();
    });
    registerSiteContentRoutes(app, {
      store: createMemoryJsonStore(),
      env,
      storageCircuit: { state: () => 'open' },
    });
    const form = new FormData();
    form.set('file', new File([new Uint8Array([1, 2, 3])], 'elena.jpg', { type: 'image/jpeg' }));
    const response = await app.request('/api/cms/site-content/team/assets', { method: 'POST', body: form });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'storage_unavailable' });
  });
});
