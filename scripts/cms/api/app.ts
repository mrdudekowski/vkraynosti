import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import {
  applyTourTextPatch,
  upsertTourInPublishedCatalog,
  type CmsTourTextPatch,
} from '../../../src/cms/applyTourTextPatch.ts';
import { allocateUploadAssetId, applyTourLayoutPatch } from '../../../src/cms/applyTourLayoutPatch.ts';
import {
  CMS_STILL_MAX_BYTES,
  CMS_VIDEO_MAX_BYTES,
  stillExtensionForMime,
  videoExtensionForMime,
} from '../../../src/cms/cmsMediaAccept.ts';
import {
  cmsCoverCropSchema,
  cmsTourDocumentSchema,
  parseCmsToursFile,
  type CmsTourDocument,
} from '../../../src/cms/cmsTourDocument.ts';
import { BENTO_BLOCK_TYPES } from '../../../src/constants/tourBento/index.ts';
import { unusedBentoPoolAssets } from '../../../src/cms/bentoPoolAssets.ts';
import { cmsPublishBlockers } from '../../../src/cms/cmsPublishRules.ts';
import { cmsDraftIndexFile, parseCmsDraftIndex } from '../../../src/cms/cmsDraftIndex.ts';
import { createEmptyCmsTour } from '../../../src/cms/createEmptyCmsTour.ts';
import { cmsTourCoverUrl } from '../../../src/cms/cmsTourCoverUrl.ts';
import { allocateUniqueSlug, nextSeasonTourId, slugFromTitle } from '../../../src/cms/cmsTourSlug.ts';
import {
  CMS_DRAFT_INDEX_KEY,
  CMS_PUBLISHED_CATALOG_KEY,
  assertCmsTourId,
  cmsDraftDocumentKey,
  cmsDraftMetaKey,
  cmsMediaObjectKey,
  cmsMediaObjectKeyFromPublicUrl,
  cmsPublishedDocumentKey,
} from '../../../src/cms/cmsPackageKeys.ts';
import { createCmsTourMeta, parseCmsTourMeta, type CmsTourMeta } from '../../../src/cms/cmsTourMeta.ts';
import { isValidTourSlug } from '../../../src/constants/tourUrls.ts';
import {
  CMS_PASSWORD_MIN_LENGTH,
  CMS_USER_LOGIN_PATTERN,
  countCmsAdmins,
  findCmsUser,
  publicCmsUsers,
} from '../../../src/cms/cmsUsers.ts';
import type { CmsApiEnv } from './env.ts';
import { hashCmsPassword, verifyCmsPassword } from './password.ts';
import {
  CMS_SESSION_COOKIE,
  CMS_SESSION_TTL_MS,
  createCmsSession,
  signCmsSession,
  verifyCmsSession,
  type CmsSession,
} from './session.ts';
import type { CmsJsonStore } from './store.ts';
import { loadOrSeedCmsUsers, saveCmsUsers } from './usersStore.ts';
import { registerCrmRoutes } from './crmRoutes.ts';

const SEASON_ORDER = ['winter', 'spring', 'summer', 'fall'] as const;

const loginBodySchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

const textPatchSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  subtitle: z.string().optional(),
  heroPhrase: z.string().optional(),
  duration: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']).optional(),
  difficultyDisplayLabel: z.string().optional(),
  metaAudienceLabel: z.string().optional(),
  price: z.string().optional(),
  pricePrevious: z.string().optional(),
  priceFootnote: z.string().optional(),
  seoDescription: z.string().optional(),
  description: z.string(),
  descriptionLeadBold: z.string().optional(),
  descriptionAside: z.string().optional(),
  prefaceAssetId: z.string().min(1).nullable(),
  included: z.array(z.object({ text: z.string(), iconKey: z.string().min(1) })),
  program: z.array(z.object({ timeLabel: z.string(), description: z.string() })),
  programAdditionalNotes: z.array(z.string()).optional(),
  assetAlts: z.record(z.string(), z.string()).optional(),
});

const createTourBodySchema = z.object({
  title: z.string().trim().min(1),
  season: z.enum(SEASON_ORDER),
  slug: z.string().trim().min(1).optional(),
});

const publishBodySchema = z.object({
  rev: z.number().int().positive(),
});

const createUserBodySchema = z.object({
  login: z.string().regex(CMS_USER_LOGIN_PATTERN),
  password: z.string().min(CMS_PASSWORD_MIN_LENGTH),
  role: z.enum(['admin', 'editor']),
});

const updateUserBodySchema = z.object({
  role: z.enum(['admin', 'editor']).optional(),
  password: z.string().min(CMS_PASSWORD_MIN_LENGTH).optional(),
});

const saveBodySchema = z.object({
  rev: z.number().int().positive(),
  patch: textPatchSchema,
  layout: z
    .object({
      coverAssetId: z.string().min(1).nullable(),
      coverCrop: cmsCoverCropSchema.optional(),
      bento: z.object({
        blocks: z.array(
          z.object({
            type: z.enum(BENTO_BLOCK_TYPES),
            slots: z.array(
              z.object({
                assetId: z.string().min(1).nullable(),
                objectPosition: z.string().optional(),
              })
            ),
          })
        ),
      }),
    })
    .optional(),
});

type AppVariables = {
  session: CmsSession;
};

export type CmsApiDeps = {
  env: CmsApiEnv;
  store: CmsJsonStore;
};

function readTourId(raw: string): string | null {
  try {
    return assertCmsTourId(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

async function readJsonBody(c: { req: { json: () => Promise<unknown> } }): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}

async function loadDraftOrPublished(
  store: CmsJsonStore,
  tourId: string
): Promise<CmsTourDocument | null> {
  const draft = await store.getJson(cmsDraftDocumentKey(tourId));
  if (draft != null) {
    return cmsTourDocumentSchema.parse(draft);
  }
  const published = await store.getJson(cmsPublishedDocumentKey(tourId));
  if (published != null) {
    return cmsTourDocumentSchema.parse(published);
  }
  return null;
}

async function persistDraft(
  store: CmsJsonStore,
  tourId: string,
  document: CmsTourDocument,
  meta: CmsTourMeta
): Promise<void> {
  await store.putJson(cmsDraftDocumentKey(tourId), document);
  await store.putJson(cmsDraftMetaKey(tourId), meta);
}

async function publishToCatalog(
  store: CmsJsonStore,
  tourId: string,
  document: CmsTourDocument
): Promise<void> {
  await store.putJson(cmsPublishedDocumentKey(tourId), document);
  const catalogRaw = await store.getJson(CMS_PUBLISHED_CATALOG_KEY);
  const catalog =
    catalogRaw == null
      ? { schemaVersion: 1 as const, tours: [] }
      : parseCmsToursFile(catalogRaw);
  await store.putJson(CMS_PUBLISHED_CATALOG_KEY, upsertTourInPublishedCatalog(catalog, document));
}

function publicMediaUrl(baseUrl: string, key: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${key}`;
}

function readPositiveIntRev(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0) {
    return raw;
  }
  if (typeof raw === 'string' && raw.length > 0) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

function mediaObjectKeysForAsset(
  tourId: string,
  asset: CmsTourDocument['assets'][number]
): string[] {
  const keys: string[] = [];
  const stillKey = cmsMediaObjectKeyFromPublicUrl(tourId, asset.stillUrl);
  if (stillKey != null) {
    keys.push(stillKey);
  }
  if (asset.videoUrl != null && asset.videoUrl.length > 0) {
    const videoKey = cmsMediaObjectKeyFromPublicUrl(tourId, asset.videoUrl);
    if (videoKey != null) {
      keys.push(videoKey);
    }
  }
  return keys;
}

async function loadMeta(store: CmsJsonStore, tourId: string, editor: string): Promise<CmsTourMeta> {
  const raw = await store.getJson(cmsDraftMetaKey(tourId));
  if (raw == null) {
    return createCmsTourMeta({ editor });
  }
  return parseCmsTourMeta(raw);
}

async function loadPublishedCatalogTours(store: CmsJsonStore): Promise<CmsTourDocument[]> {
  const raw = await store.getJson(CMS_PUBLISHED_CATALOG_KEY);
  if (raw == null) {
    return [];
  }
  return parseCmsToursFile(raw).tours;
}

async function loadDraftIndexIds(store: CmsJsonStore): Promise<string[]> {
  const raw = await store.getJson(CMS_DRAFT_INDEX_KEY);
  if (raw == null) {
    return [];
  }
  try {
    return parseCmsDraftIndex(raw);
  } catch {
    return [];
  }
}

function uniqueTourIds(published: CmsTourDocument[], draftIds: string[]): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const id of [...published.map((tour) => tour.id), ...draftIds]) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

async function listCmsTourDocuments(store: CmsJsonStore): Promise<CmsTourDocument[]> {
  const published = await loadPublishedCatalogTours(store);
  const publishedById = new Map(published.map((tour) => [tour.id, tour]));
  const tours: CmsTourDocument[] = [];
  for (const id of uniqueTourIds(published, await loadDraftIndexIds(store))) {
    const draftRaw = await store.getJson(cmsDraftDocumentKey(id));
    const draft = draftRaw != null ? cmsTourDocumentSchema.parse(draftRaw) : null;
    const document = draft ?? publishedById.get(id);
    if (document != null) {
      tours.push(document);
    }
  }
  return tours;
}

function sortCmsTourSummaries(tours: CmsTourDocument[]): CmsTourDocument[] {
  const seasonRank = new Map(SEASON_ORDER.map((season, index) => [season, index]));
  return [...tours].sort((left, right) => {
    const seasonDelta = (seasonRank.get(left.season) ?? 99) - (seasonRank.get(right.season) ?? 99);
    if (seasonDelta !== 0) {
      return seasonDelta;
    }
    return left.id.localeCompare(right.id);
  });
}

function takenSlugKeys(tours: CmsTourDocument[], exceptId?: string): Set<string> {
  const taken = new Set<string>();
  for (const tour of tours) {
    if (tour.id === exceptId) {
      continue;
    }
    taken.add(tour.slug);
    taken.add(tour.id);
  }
  return taken;
}

async function appendDraftIndexId(store: CmsJsonStore, tourId: string): Promise<void> {
  const current = await loadDraftIndexIds(store);
  await store.putJson(CMS_DRAFT_INDEX_KEY, cmsDraftIndexFile([...current, tourId]));
}

export function createCmsApiApp(deps: CmsApiDeps) {
  const { env, store } = deps;
  const app = new Hono<{ Variables: AppVariables }>();

  app.get('/api/cms/health', (c) => c.json({ ok: true }));

  app.post('/api/cms/login', async (c) => {
    const parsed = loginBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const usersFile = await loadOrSeedCmsUsers(store, env);
    const user = findCmsUser(usersFile, parsed.data.login);
    if (user == null || !verifyCmsPassword(parsed.data.password, user.password)) {
      return c.json({ error: 'invalid_credentials' }, 401);
    }
    const session = createCmsSession(user.login, user.role);
    setCookie(c, CMS_SESSION_COOKIE, signCmsSession(session, env.authSecret), {
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: Math.floor(CMS_SESSION_TTL_MS / 1000),
      secure: false,
    });
    return c.json({ login: user.login, role: user.role });
  });

  app.post('/api/cms/logout', (c) => {
    deleteCookie(c, CMS_SESSION_COOKIE, { path: '/' });
    return c.json({ ok: true });
  });

  app.use('/api/cms/*', async (c, next) => {
    if (
      c.req.path === '/api/cms/login' ||
      c.req.path === '/api/cms/health' ||
      c.req.path === '/api/cms/crm/inbound'
    ) {
      return next();
    }
    const token = getCookie(c, CMS_SESSION_COOKIE);
    if (token == null || token.length === 0) {
      return c.json({ error: 'unauthorized' }, 401);
    }
    const session = verifyCmsSession(token, env.authSecret);
    if (session == null) {
      return c.json({ error: 'unauthorized' }, 401);
    }
    c.set('session', session);
    await next();
  });

  app.get('/api/cms/me', (c) => {
    const session = c.get('session');
    return c.json({ login: session.sub, role: session.role });
  });

  app.get('/api/cms/tours', async (c) => {
    const publishedIds = new Set(
      (await loadPublishedCatalogTours(store)).map((tour) => tour.id),
    );
    const tours = sortCmsTourSummaries(await listCmsTourDocuments(store));
    return c.json({
      tours: tours.map((tour) => ({
        id: tour.id,
        title: tour.title,
        season: tour.season,
        status: tour.status,
        published: publishedIds.has(tour.id),
        imageUrl: cmsTourCoverUrl(tour),
      })),
    });
  });

  app.post('/api/cms/tours', async (c) => {
    const parsed = createTourBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const existing = await listCmsTourDocuments(store);
    const taken = takenSlugKeys(existing);
    const requestedSlug = parsed.data.slug;
    let slug: string;
    if (requestedSlug != null) {
      if (!isValidTourSlug(requestedSlug)) {
        return c.json({ error: 'invalid_slug' }, 400);
      }
      if (taken.has(requestedSlug)) {
        return c.json({ error: 'slug_taken' }, 409);
      }
      slug = requestedSlug;
    } else {
      slug = allocateUniqueSlug(slugFromTitle(parsed.data.title), taken);
    }
    const tourId = nextSeasonTourId(
      parsed.data.season,
      existing.map((tour) => tour.id),
    );
    const document = createEmptyCmsTour({
      id: tourId,
      slug,
      season: parsed.data.season,
      title: parsed.data.title,
    });
    const session = c.get('session');
    const meta = createCmsTourMeta({ editor: session.sub });
    await persistDraft(store, tourId, document, meta);
    await appendDraftIndexId(store, tourId);
    return c.json({ document, meta }, 201);
  });

  app.get('/api/cms/tours/:id', async (c) => {
    const tourId = readTourId(c.req.param('id'));
    if (tourId == null) {
      return c.json({ error: 'invalid_id' }, 400);
    }
    const document = await loadDraftOrPublished(store, tourId);
    if (document == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const meta = await loadMeta(store, tourId, c.get('session').sub);
    return c.json({ document, meta });
  });

  app.put('/api/cms/tours/:id', async (c) => {
    const tourId = readTourId(c.req.param('id'));
    if (tourId == null) {
      return c.json({ error: 'invalid_id' }, 400);
    }
    const parsed = saveBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const document = await loadDraftOrPublished(store, tourId);
    if (document == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const session = c.get('session');
    const meta = await loadMeta(store, tourId, session.sub);
    if (meta.rev !== parsed.data.rev) {
      return c.json({ error: 'rev_conflict', rev: meta.rev }, 409);
    }

    let nextDocument: CmsTourDocument;
    try {
      nextDocument = applyTourTextPatch(document, parsed.data.patch as CmsTourTextPatch);
      if (parsed.data.layout != null) {
        nextDocument = applyTourLayoutPatch(nextDocument, parsed.data.layout);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'invalid_patch';
      return c.json({ error: message }, 400);
    }

    if (nextDocument.slug !== document.slug) {
      const taken = takenSlugKeys(await listCmsTourDocuments(store), tourId);
      if (taken.has(nextDocument.slug)) {
        return c.json({ error: 'slug_taken' }, 409);
      }
    }

    const nextMeta = createCmsTourMeta({
      rev: meta.rev + 1,
      editor: session.sub,
    });
    await persistDraft(store, tourId, nextDocument, nextMeta);
    return c.json({ document: nextDocument, meta: nextMeta });
  });

  app.post('/api/cms/tours/:id/assets', async (c) => {
    const tourId = readTourId(c.req.param('id'));
    if (tourId == null) {
      return c.json({ error: 'invalid_id' }, 400);
    }
    const document = await loadDraftOrPublished(store, tourId);
    if (document == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const session = c.get('session');
    const meta = await loadMeta(store, tourId, session.sub);
    const form = await c.req.parseBody();
    const revRaw = typeof form.rev === 'string' ? Number.parseInt(form.rev, 10) : Number.NaN;
    if (!Number.isInteger(revRaw) || revRaw !== meta.rev) {
      return c.json({ error: 'rev_conflict', rev: meta.rev }, 409);
    }
    const still = form.still;
    if (!(still instanceof File)) {
      return c.json({ error: 'still_required' }, 400);
    }
    const stillMime = still.type || 'application/octet-stream';
    const stillExt = stillExtensionForMime(stillMime);
    if (stillExt == null) {
      return c.json({ error: 'invalid_still_type' }, 400);
    }
    if (still.size > CMS_STILL_MAX_BYTES) {
      return c.json({ error: 'still_too_large' }, 400);
    }

    const video = form.video;
    let videoExt: string | null = null;
    let videoFile: File | null = null;
    if (video instanceof File && video.size > 0) {
      videoExt = videoExtensionForMime(video.type || 'application/octet-stream');
      if (videoExt == null) {
        return c.json({ error: 'invalid_video_type' }, 400);
      }
      if (video.size > CMS_VIDEO_MAX_BYTES) {
        return c.json({ error: 'video_too_large' }, 400);
      }
      videoFile = video;
    }

    const assetId = allocateUploadAssetId(document.assets.map((asset) => asset.id));
    const stillKey = cmsMediaObjectKey(tourId, `${assetId}.${stillExt}`);
    const stillBytes = new Uint8Array(await still.arrayBuffer());
    await store.putBytes(stillKey, stillBytes, stillMime);

    let videoUrl: string | null = null;
    if (videoFile != null && videoExt != null) {
      const videoKey = cmsMediaObjectKey(tourId, `${assetId}.${videoExt}`);
      await store.putBytes(
        videoKey,
        new Uint8Array(await videoFile.arrayBuffer()),
        videoFile.type || `video/${videoExt}`
      );
      videoUrl = publicMediaUrl(env.s3.publicBaseUrl, videoKey);
    }

    const alt = typeof form.alt === 'string' ? form.alt.trim() : '';
    const nextDocument = cmsTourDocumentSchema.parse({
      ...document,
      assets: [
        ...document.assets,
        {
          id: assetId,
          stillUrl: publicMediaUrl(env.s3.publicBaseUrl, stillKey),
          videoUrl,
          alt,
        },
      ],
    });
    const nextMeta = createCmsTourMeta({
      rev: meta.rev + 1,
      editor: session.sub,
    });
    await persistDraft(store, tourId, nextDocument, nextMeta);
    return c.json({ document: nextDocument, meta: nextMeta, assetId }, 201);
  });

  app.delete('/api/cms/tours/:id/assets/:assetId', async (c) => {
    const tourId = readTourId(c.req.param('id'));
    if (tourId == null) {
      return c.json({ error: 'invalid_id' }, 400);
    }
    const assetId = c.req.param('assetId');
    if (assetId == null || assetId.length === 0 || assetId.includes('/')) {
      return c.json({ error: 'invalid_asset' }, 400);
    }
    const document = await loadDraftOrPublished(store, tourId);
    if (document == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const session = c.get('session');
    const meta = await loadMeta(store, tourId, session.sub);
    const body = await readJsonBody(c);
    const rev =
      readPositiveIntRev(c.req.query('rev')) ??
      (body != null && typeof body === 'object' && 'rev' in body
        ? readPositiveIntRev((body as { rev: unknown }).rev)
        : null);
    if (rev == null) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    if (rev !== meta.rev) {
      return c.json({ error: 'rev_conflict', rev: meta.rev }, 409);
    }
    const asset = document.assets.find((item) => item.id === assetId);
    if (asset == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const unused = unusedBentoPoolAssets(document);
    if (!unused.some((item) => item.id === assetId)) {
      return c.json({ error: 'asset_in_use' }, 409);
    }

    const nextDocument = cmsTourDocumentSchema.parse({
      ...document,
      assets: document.assets.filter((item) => item.id !== assetId),
    });
    const nextMeta = createCmsTourMeta({
      rev: meta.rev + 1,
      editor: session.sub,
    });
    await persistDraft(store, tourId, nextDocument, nextMeta);
    for (const key of mediaObjectKeysForAsset(tourId, asset)) {
      try {
        await store.deleteBytes(key);
      } catch {
        // JSON уже без кадра; объект в бакете подчищаем по возможности.
      }
    }
    return c.json({ document: nextDocument, meta: nextMeta });
  });

  app.post('/api/cms/tours/:id/publish', async (c) => {
    const session = c.get('session');
    if (session.role !== 'admin') {
      return c.json({ error: 'forbidden' }, 403);
    }
    const tourId = readTourId(c.req.param('id'));
    if (tourId == null) {
      return c.json({ error: 'invalid_id' }, 400);
    }
    const parsed = publishBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const document = await loadDraftOrPublished(store, tourId);
    if (document == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const meta = await loadMeta(store, tourId, session.sub);
    if (meta.rev !== parsed.data.rev) {
      return c.json({ error: 'rev_conflict', rev: meta.rev }, 409);
    }
    const blockers = cmsPublishBlockers(document);
    if (blockers.length > 0) {
      return c.json({ error: blockers[0], blockers }, 400);
    }
    const nextMeta = createCmsTourMeta({
      rev: meta.rev + 1,
      editor: session.sub,
    });
    await persistDraft(store, tourId, document, nextMeta);
    await publishToCatalog(store, tourId, document);
    return c.json({ document, meta: nextMeta });
  });

  app.get('/api/cms/users', async (c) => {
    if (c.get('session').role !== 'admin') {
      return c.json({ error: 'forbidden' }, 403);
    }
    const file = await loadOrSeedCmsUsers(store, env);
    return c.json({ users: publicCmsUsers(file) });
  });

  app.post('/api/cms/users', async (c) => {
    if (c.get('session').role !== 'admin') {
      return c.json({ error: 'forbidden' }, 403);
    }
    const parsed = createUserBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const file = await loadOrSeedCmsUsers(store, env);
    if (findCmsUser(file, parsed.data.login) != null) {
      return c.json({ error: 'login_taken' }, 409);
    }
    const next = {
      ...file,
      users: [
        ...file.users,
        {
          login: parsed.data.login,
          password: hashCmsPassword(parsed.data.password),
          role: parsed.data.role,
        },
      ],
    };
    await saveCmsUsers(store, next);
    return c.json({ users: publicCmsUsers(next) }, 201);
  });

  app.put('/api/cms/users/:login', async (c) => {
    if (c.get('session').role !== 'admin') {
      return c.json({ error: 'forbidden' }, 403);
    }
    const login = c.req.param('login');
    const parsed = updateUserBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    if (parsed.data.role == null && parsed.data.password == null) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const file = await loadOrSeedCmsUsers(store, env);
    const current = findCmsUser(file, login);
    if (current == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const nextRole = parsed.data.role ?? current.role;
    if (
      current.role === 'admin' &&
      nextRole !== 'admin' &&
      countCmsAdmins(file) <= 1
    ) {
      return c.json({ error: 'last_admin' }, 409);
    }
    const next = {
      ...file,
      users: file.users.map((user) =>
        user.login === login
          ? {
              ...user,
              role: nextRole,
              password:
                parsed.data.password != null
                  ? hashCmsPassword(parsed.data.password)
                  : user.password,
            }
          : user
      ),
    };
    await saveCmsUsers(store, next);
    return c.json({ users: publicCmsUsers(next) });
  });

  app.delete('/api/cms/users/:login', async (c) => {
    const session = c.get('session');
    if (session.role !== 'admin') {
      return c.json({ error: 'forbidden' }, 403);
    }
    const login = c.req.param('login');
    if (login === session.sub) {
      return c.json({ error: 'cannot_delete_self' }, 409);
    }
    const file = await loadOrSeedCmsUsers(store, env);
    const current = findCmsUser(file, login);
    if (current == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    if (current.role === 'admin' && countCmsAdmins(file) <= 1) {
      return c.json({ error: 'last_admin' }, 409);
    }
    const next = {
      ...file,
      users: file.users.filter((user) => user.login !== login),
    };
    await saveCmsUsers(store, next);
    return c.json({ users: publicCmsUsers(next) });
  });

  registerCrmRoutes(app, store, env);

  return app;
}
