import { z } from 'zod';
import type { Context, Hono } from 'hono';
import { randomUUID } from 'node:crypto';
import { createCmsTourMeta, parseCmsTourMeta, type CmsTourMeta } from '../../../src/cms/cmsTourMeta.ts';
import {
  parseSiteContentDocument,
  SITE_CONTENT_KINDS,
  type SiteContentDocument,
  type SiteContentDocumentKind,
} from '../../../src/cms/siteContentDocument.ts';
import {
  siteContentDraftKey,
  siteContentDraftMetaKey,
  siteContentPublishedKey,
  siteContentMediaPrefix,
} from '../../../src/cms/siteContentPackageKeys.ts';
import { seedSiteContentDocuments } from '../../../src/cms/siteContentSeed.ts';
import { SITE_CONTENT_KIND_LABELS, siteContentChanges, type SiteContentChangesItem } from '../../../src/cms/siteContentChanges.ts';
import type { CmsApiEnv } from './env.ts';
import type { CmsSession } from './session.ts';
import type { CmsJsonStore } from './store.ts';

type SiteContentEnv = { Variables: { session: CmsSession } };
type SiteContentContext = Context<SiteContentEnv>;
type SiteContentApp = Pick<Hono<SiteContentEnv>, 'get' | 'put' | 'post' | 'delete'>;

const saveBodySchema = z.object({
  rev: z.number().int().positive(),
  document: z.unknown(),
});

const publishBodySchema = z.object({ rev: z.number().int().positive() });

function isSiteContentKind(value: string): value is SiteContentDocumentKind {
  return (SITE_CONTENT_KINDS as readonly string[]).includes(value);
}

export function siteContentSessionCanEdit(session: CmsSession): boolean {
  return session.role === 'admin' || session.canEditSiteContent;
}

async function readJsonBody(context: SiteContentContext): Promise<unknown> {
  try {
    return await context.req.json();
  } catch {
    return null;
  }
}

async function loadDraft(
  store: CmsJsonStore,
  kind: SiteContentDocumentKind,
  editor: string,
): Promise<{ document: SiteContentDocument; meta: CmsTourMeta }> {
  const seeded = seedSiteContentDocuments()[kind];
  const rawDocument = await store.getJson(siteContentDraftKey(kind));
  if (rawDocument == null) {
    const document = parseSiteContentDocument(kind, seeded);
    const meta = createCmsTourMeta({ editor });
    await store.putJson(siteContentDraftKey(kind), document);
    await store.putJson(siteContentDraftMetaKey(kind), meta);
    return { document, meta };
  }
  const document = parseSiteContentDocument(kind, rawDocument);
  const rawMeta = await store.getJson(siteContentDraftMetaKey(kind));
  const meta = rawMeta == null ? createCmsTourMeta({ editor }) : parseCmsTourMeta(rawMeta);
  return { document, meta };
}

function invalidKind(context: SiteContentContext): Response {
  return context.json({ error: 'invalid_kind' }, 400);
}

export function registerSiteContentRoutes(
  app: SiteContentApp,
  deps: { store: CmsJsonStore; env: CmsApiEnv },
): void {
  app.get('/api/cms/site-content/:kind', async (c: SiteContentContext) => {
    const kind = c.req.param('kind');
    if (!isSiteContentKind(kind)) return invalidKind(c);
    const session = c.get('session') as CmsSession;
    if (!siteContentSessionCanEdit(session)) return c.json({ error: 'forbidden' }, 403);
    const result = await loadDraft(deps.store, kind, session.sub);
    return c.json(result);
  });

  app.get('/api/cms/site-content-changes', async (c: SiteContentContext) => {
    const session = c.get('session') as CmsSession;
    if (!siteContentSessionCanEdit(session)) return c.json({ error: 'forbidden' }, 403);
    const items: SiteContentChangesItem[] = [];
    for (const kind of SITE_CONTENT_KINDS) {
      const draft = await loadDraft(deps.store, kind, session.sub);
      const rawPublished = await deps.store.getJson(siteContentPublishedKey(kind));
      const published = rawPublished == null ? null : parseSiteContentDocument(kind, rawPublished);
      const changes = siteContentChanges(kind, draft.document, published ?? seedSiteContentDocuments()[kind]);
      if (changes.length === 0) continue;
      items.push({ kind, title: SITE_CONTENT_KIND_LABELS[kind], author: draft.meta.editor, timestamp: draft.meta.updatedAt, rev: draft.meta.rev, changes });
    }
    return c.json({ items });
  });

  app.put('/api/cms/site-content/:kind', async (c: SiteContentContext) => {
    const kind = c.req.param('kind');
    if (!isSiteContentKind(kind)) return invalidKind(c);
    const session = c.get('session') as CmsSession;
    if (!siteContentSessionCanEdit(session)) return c.json({ error: 'forbidden' }, 403);
    const parsed = saveBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) return c.json({ error: 'invalid_body' }, 400);
    const current = await loadDraft(deps.store, kind, session.sub);
    if (parsed.data.rev !== current.meta.rev) return c.json({ error: 'rev_conflict' }, 409);
    const document = parseSiteContentDocument(kind, parsed.data.document);
    const meta = createCmsTourMeta({
      rev: current.meta.rev + 1,
      editor: session.sub,
      submittedForPublishAt: new Date().toISOString(),
    });
    await deps.store.putJson(siteContentDraftKey(kind), document);
    await deps.store.putJson(siteContentDraftMetaKey(kind), meta);
    return c.json({ document, meta });
  });

  app.post('/api/cms/site-content/:kind/publish', async (c: SiteContentContext) => {
    const kind = c.req.param('kind');
    if (!isSiteContentKind(kind)) return invalidKind(c);
    const session = c.get('session') as CmsSession;
    if (!siteContentSessionCanEdit(session)) return c.json({ error: 'forbidden' }, 403);
    const parsed = publishBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) return c.json({ error: 'invalid_body' }, 400);
    const current = await loadDraft(deps.store, kind, session.sub);
    if (parsed.data.rev !== current.meta.rev) return c.json({ error: 'rev_conflict' }, 409);
    await deps.store.putJson(siteContentPublishedKey(kind), current.document);
    const meta = createCmsTourMeta({
      ...current.meta,
      editor: session.sub,
      submittedForPublishAt: null,
    });
    await deps.store.putJson(siteContentDraftMetaKey(kind), meta);
    return c.json({ document: current.document, meta });
  });

  app.post('/api/cms/site-content/:kind/assets', async (c: SiteContentContext) => {
    const kind = c.req.param('kind');
    if (!isSiteContentKind(kind)) return invalidKind(c);
    const session = c.get('session') as CmsSession;
    if (!siteContentSessionCanEdit(session)) return c.json({ error: 'forbidden' }, 403);
    const form = await c.req.parseBody();
    const file = form.file;
    if (!(file instanceof File)) return c.json({ error: 'file_required' }, 400);
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']);
    if (!allowed.has(file.type) || file.size > 10 * 1024 * 1024) return c.json({ error: 'invalid_file' }, 400);
    const assetId = randomUUID();
    const key = `${siteContentMediaPrefix(kind)}${assetId}`;
    await deps.store.putBytes(key, new Uint8Array(await file.arrayBuffer()), file.type);
    const asset = { assetId, url: `${deps.env.s3.publicBaseUrl.replace(/\/+$/, '')}/${key}`, mimeType: file.type, alt: typeof form.alt === 'string' ? form.alt.trim() : '' };
    return c.json({ asset }, 201);
  });

  app.delete('/api/cms/site-content/:kind/assets/:assetId', async (c: SiteContentContext) => {
    const kind = c.req.param('kind');
    if (!isSiteContentKind(kind)) return invalidKind(c);
    const session = c.get('session') as CmsSession;
    if (!siteContentSessionCanEdit(session)) return c.json({ error: 'forbidden' }, 403);
    const assetId = c.req.param('assetId');
    if (!assetId || assetId.includes('/')) return c.json({ error: 'invalid_asset' }, 400);
    await deps.store.deleteBytes(`${siteContentMediaPrefix(kind)}${assetId}`);
    return c.body(null, 204);
  });
}
