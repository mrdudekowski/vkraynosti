import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
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
  CMS_TOUR_STATUSES,
  cmsCoverCropSchema,
  cmsTourDocumentSchema,
  parseCmsToursFile,
  type CmsTourDocument,
} from '../../../src/cms/cmsTourDocument.ts';
import { BENTO_BLOCK_TYPES } from '../../../src/constants/tourBento/index.ts';
import { unusedBentoPoolAssets } from '../../../src/cms/bentoPoolAssets.ts';
import { cmsPublishBlockersForIntent } from '../../../src/cms/cmsPublishRules.ts';
import {
  departureNeedsPublication,
  livePublishQueue,
  documentToPublishForQueue,
  guestScheduleDeparturesFromSnapshots,
  nextSubmittedForPublishAt,
  toGuestTourDataFiles,
  type QueueDepartureInput,
  type QueueTourInput,
} from '../../../src/cms/publishQueue.ts';
import { tourReadiness, tourReadinessCounts } from '../../../src/cms/tourCompleteness.ts';
import { vladivostokCalendarDate } from '../../../src/admin/scheduleCalendar.ts';
import { cmsDraftIndexFile, parseCmsDraftIndex } from '../../../src/cms/cmsDraftIndex.ts';
import { createEmptyCmsTour } from '../../../src/cms/createEmptyCmsTour.ts';
import { cmsTourCoverUrl } from '../../../src/cms/cmsTourCoverUrl.ts';
import { checkHideTourPublish } from '../../../src/cms/hideTourFutureDepartures.ts';
import { resolvePublishedTourDocument } from '../../../src/cms/publishedTourSnapshot.ts';
import { loadCrmFile } from './crmStore.ts';
import { allocateUniqueSlug, nextSeasonTourId, slugFromTitle } from '../../../src/cms/cmsTourSlug.ts';
import {
  CMS_DRAFT_INDEX_KEY,
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
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
} from '../../../src/cms/cmsUsers.ts';
import type { CmsApiEnv } from './env.ts';
import { hashCmsPassword, verifyCmsPassword } from './password.ts';
import {
  CMS_SESSION_COOKIE,
  CMS_SESSION_TTL_MS,
  createRawSessionToken,
  hashSessionToken,
  type CmsSession,
} from './session.ts';
import type { CmsJsonStore } from './store.ts';
import { CmsLastAdminError, type AuthRepository, type UserRecord } from './auth/authRepository.ts';
import { registerCrmRoutes } from './crmRoutes.ts';
import {
  CmsDepartureCompletedError,
  CmsDepartureDuplicateError,
  CmsDepartureNotFoundError,
  CmsDeparturePublishedError,
  CmsDepartureVersionConflictError,
  CmsInvalidStartsOnError,
  CmsTourNotReadyError,
  type DepartureRepository,
  type DepartureWithEndDate,
  isValidStartsOn,
} from './schedule/departureRepository.ts';

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
  durationDays: z.number().int().min(1).optional(),
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
  confirmDeleteFutureDepartures: z.boolean().optional(),
});

const createUserBodySchema = z.object({
  login: z.string().regex(CMS_USER_LOGIN_PATTERN),
  password: z.string().min(CMS_PASSWORD_MIN_LENGTH),
  role: z.enum(['admin', 'editor']),
});

const updateUserBodySchema = z
  .object({
    role: z.enum(['admin', 'editor']).optional(),
    password: z.string().min(CMS_PASSWORD_MIN_LENGTH).optional(),
    canPublishTours: z.boolean().optional(),
    canPublishSchedule: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.role != null ||
      value.password != null ||
      value.canPublishTours != null ||
      value.canPublishSchedule != null,
  );

const submitQueueBodySchema = z.object({
  tourIds: z.array(z.string().min(1)).optional(),
  departureIds: z.array(z.string().min(1)).optional(),
  tourRevs: z.record(z.string().min(1), z.number().int().positive()).optional(),
  confirmDeleteFutureDepartures: z.boolean().optional(),
});

const publishDeparturesBodySchema = z
  .object({
    ids: z.array(z.string().uuid()).optional(),
    allEligible: z.boolean().optional(),
  })
  .refine((value) => value.allEligible === true || (value.ids != null && value.ids.length > 0));

const isoDateSchema = z.string().refine(isValidStartsOn);

const listDeparturesQuerySchema = z.object({
  from: isoDateSchema,
  to: isoDateSchema,
  includeHistory: z.enum(['true', 'false']).optional().default('false'),
});

const createDepartureBodySchema = z.object({
  tourId: z.string().min(1),
  startsOn: isoDateSchema,
  seats: z.number().int().positive().optional(),
});

const updateDepartureBodySchema = z
  .object({
    version: z.number().int().positive(),
    startsOn: isoDateSchema.optional(),
    seats: z.number().int().positive().optional(),
    status: z.enum(['planned', 'open', 'full', 'cancelled']).optional(),
  })
  .refine(
    ({ startsOn, seats, status }) => startsOn != null || seats != null || status != null,
  );

const saveBodySchema = z.object({
  rev: z.number().int().positive(),
  patch: textPatchSchema,
  status: z.enum(CMS_TOUR_STATUSES).optional(),
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
  authRepository: AuthRepository;
  departureRepository: DepartureRepository;
};

function publicAuthUsers(records: UserRecord[]): Array<{
  login: string;
  role: UserRecord['role'];
  canPublishTours: boolean;
  canPublishSchedule: boolean;
}> {
  return records.map((user) => ({
    login: user.login,
    role: user.role,
    canPublishTours: user.canPublishTours,
    canPublishSchedule: user.canPublishSchedule,
  }));
}

function effectivePublishFlags(user: Pick<UserRecord, 'role' | 'canPublishTours' | 'canPublishSchedule'>): {
  canPublishTours: boolean;
  canPublishSchedule: boolean;
} {
  return {
    canPublishTours: user.role === 'admin' || user.canPublishTours,
    canPublishSchedule: user.role === 'admin' || user.canPublishSchedule,
  };
}

function publicActor(session: CmsSession) {
  return {
    login: session.sub,
    role: session.role,
    canPublishTours: session.canPublishTours,
    canPublishSchedule: session.canPublishSchedule,
  };
}

function nextDraftMeta(
  meta: CmsTourMeta,
  editor: string,
  draft: CmsTourDocument,
  publishedDocument: CmsTourDocument | null,
): CmsTourMeta {
  if (meta.returnReason != null && meta.returnReason.length > 0) {
    return createCmsTourMeta({
      rev: meta.rev + 1,
      editor,
      submittedForPublishAt: null,
      returnReason: meta.returnReason,
    });
  }
  const submittedForPublishAt = nextSubmittedForPublishAt({
    draft,
    publishedDocument,
    currentSubmittedAt: meta.submittedForPublishAt,
    nowIso: new Date().toISOString(),
  });
  return createCmsTourMeta({
    rev: meta.rev + 1,
    editor,
    submittedForPublishAt,
    returnReason: null,
  });
}

function isoTimestamp(value: Date | string | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : value;
}

function isoDateOnly(value: Date | string): string {
  return (value instanceof Date ? value.toISOString() : String(value)).slice(0, 10);
}

function toQueueDeparture(departure: {
  id: string;
  tourId: string;
  startsOn: Date | string;
  seats: number;
  status: QueueDepartureInput['status'];
  submittedForPublishAt: Date | string | null;
  publishedAt: Date | string | null;
  publishedStartsOn?: Date | string | null;
  publishedSeats?: number | null;
  publishedStatus?: QueueDepartureInput['status'] | null;
  updatedAt: Date | string;
}): QueueDepartureInput {
  return {
    id: departure.id,
    tourId: departure.tourId,
    startsOn: isoDateOnly(departure.startsOn),
    seats: departure.seats,
    status: departure.status,
    submittedForPublishAt: isoTimestamp(departure.submittedForPublishAt),
    publishedAt: isoTimestamp(departure.publishedAt),
    publishedStartsOn:
      departure.publishedStartsOn == null ? null : isoDateOnly(departure.publishedStartsOn),
    publishedSeats: departure.publishedSeats ?? null,
    publishedStatus: departure.publishedStatus ?? null,
    updatedAt: isoTimestamp(departure.updatedAt) ?? new Date().toISOString(),
  };
}

async function seedLocalCmsUsersIfEmpty(
  authRepository: AuthRepository,
  env: CmsApiEnv
): Promise<void> {
  const existing = await authRepository.listUsers();
  if (existing.length > 0) {
    return;
  }
  for (const user of env.users) {
    await authRepository.createUser({
      login: user.login,
      passwordHash: hashCmsPassword(user.password),
      role: user.role,
    });
  }
}

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

function hasInvalidStartsOn(body: unknown): boolean {
  if (body == null || typeof body !== 'object' || !('startsOn' in body)) {
    return false;
  }
  const startsOn = (body as { startsOn?: unknown }).startsOn;
  return typeof startsOn !== 'string' || !isValidStartsOn(startsOn);
}

export async function loadDraftOrPublished(
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
  await ensureDraftIndexId(store, tourId);
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

async function loadPerTourPublishedDocument(
  store: CmsJsonStore,
  tourId: string
): Promise<CmsTourDocument | null> {
  const raw = await store.getJson(cmsPublishedDocumentKey(tourId));
  if (raw == null) {
    return null;
  }
  return cmsTourDocumentSchema.parse(raw);
}

async function loadPublishedDocument(
  store: CmsJsonStore,
  tourId: string
): Promise<CmsTourDocument | null> {
  const perTour = await loadPerTourPublishedDocument(store, tourId);
  if (perTour != null) {
    return resolvePublishedTourDocument(perTour, null);
  }
  const overlay = await loadPublishedCatalogTours(store);
  const overlayTour = overlay.find((tour) => tour.id === tourId) ?? null;
  return resolvePublishedTourDocument(null, overlayTour);
}

export async function loadTourDocumentForDepartureWrite(
  store: CmsJsonStore,
  tourId: string,
): Promise<CmsTourDocument | null> {
  const published = await loadPublishedDocument(store, tourId);
  if (published != null) {
    return published;
  }
  return loadDraftOrPublished(store, tourId);
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

async function listCmsTourDocumentsWithPublication(
  store: CmsJsonStore,
): Promise<{ documents: CmsTourDocument[]; publishedById: ReadonlyMap<string, CmsTourDocument> }> {
  const overlay = await loadPublishedCatalogTours(store);
  const overlayById = new Map(overlay.map((tour) => [tour.id, tour]));
  const ids = uniqueTourIds(overlay, await loadDraftIndexIds(store));
  const documentsAndPublished = await Promise.all(
    ids.map(async (id) => {
      const draftRaw = await store.getJson(cmsDraftDocumentKey(id));
      const draft = draftRaw != null ? cmsTourDocumentSchema.parse(draftRaw) : null;
      const publishedDocument = resolvePublishedTourDocument(
        await loadPerTourPublishedDocument(store, id),
        overlayById.get(id),
      );
      return {
        document: draft ?? publishedDocument ?? overlayById.get(id) ?? null,
        publishedDocument,
      };
    }),
  );
  const publishedById = new Map<string, CmsTourDocument>();
  const documents: CmsTourDocument[] = [];
  for (const item of documentsAndPublished) {
    if (item.document == null) {
      continue;
    }
    documents.push(item.document);
    if (item.publishedDocument != null) {
      publishedById.set(item.document.id, item.publishedDocument);
    }
  }
  return { documents, publishedById };
}

async function listCmsTourDocuments(store: CmsJsonStore): Promise<CmsTourDocument[]> {
  return (await listCmsTourDocumentsWithPublication(store)).documents;
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
  await ensureDraftIndexId(store, tourId);
}

async function ensureDraftIndexId(store: CmsJsonStore, tourId: string): Promise<void> {
  const current = await loadDraftIndexIds(store);
  if (current.includes(tourId)) {
    return;
  }
  await store.putJson(CMS_DRAFT_INDEX_KEY, cmsDraftIndexFile([...current, tourId]));
}

function publicDeparture(departure: DepartureWithEndDate, title?: string) {
  return {
    id: departure.id,
    tourId: departure.tourId,
    ...(title == null ? {} : { title }),
    startsOn: departure.startsOn,
    ...(departure.endsOn == null ? {} : { endsOn: departure.endsOn }),
    seats: departure.seats,
    status: departure.status,
    version: departure.version,
    createdAt: departure.createdAt,
    updatedAt: departure.updatedAt,
    publishedAt: isoTimestamp(departure.publishedAt),
    publishedStartsOn:
      departure.publishedStartsOn == null ? null : isoDateOnly(departure.publishedStartsOn),
    publishedSeats: departure.publishedSeats,
    publishedStatus: departure.publishedStatus,
  };
}

async function actorUserId(
  authRepository: AuthRepository,
  session: CmsSession,
): Promise<string | null> {
  return (await authRepository.findUserByLogin(session.sub))?.id ?? null;
}

async function departureWithEndDate(
  departureRepository: DepartureRepository,
  departure: Awaited<ReturnType<DepartureRepository['createDeparture']>>,
): Promise<DepartureWithEndDate> {
  const departures = await departureRepository.listDepartures({
    from: departure.startsOn,
    to: departure.startsOn,
    includeHistory: true,
  });
  return departures.find(({ id }) => id === departure.id) ?? departure;
}

function departureErrorResponse(error: unknown): {
  error: string;
  status: 400 | 409;
} | null {
  if (error instanceof CmsTourNotReadyError || error instanceof CmsInvalidStartsOnError) {
    return { error: error.code, status: 400 };
  }
  if (
    error instanceof CmsDepartureDuplicateError ||
    error instanceof CmsDepartureVersionConflictError ||
    error instanceof CmsDepartureCompletedError ||
    error instanceof CmsDeparturePublishedError
  ) {
    return { error: error.code, status: 409 };
  }
  return null;
}

export function createCmsApiApp(deps: CmsApiDeps) {
  const { env, store, authRepository, departureRepository } = deps;
  const app = new Hono<{ Variables: AppVariables }>();
  const allowedOrigins = new Set(
    (process.env.CMS_CORS_ORIGINS ??
      'https://mrdudekowski-vkraynosti-61ea.twc1.net,https://admin.vkraynosti.ru,https://vkraynosti.ru,https://www.vkraynosti.ru')
      .split(',')
      .map((origin) => origin.trim().replace(/\/+$/, ''))
      .filter(Boolean)
  );
  app.use(
    '/api/cms/*',
    cors({
      origin: (origin) => (allowedOrigins.has(origin) ? origin : undefined),
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
      credentials: true,
      maxAge: 600,
    })
  );
  const seedPromise = seedLocalCmsUsersIfEmpty(authRepository, env);

  async function loadQueueTours(): Promise<QueueTourInput[]> {
    const { documents, publishedById } = await listCmsTourDocumentsWithPublication(store);
    return Promise.all(
      documents.map(async (document) => {
        const publishedDocument = publishedById.get(document.id) ?? null;
        return {
          id: document.id,
          title: document.title,
          document,
          meta: await loadMeta(store, document.id, 'cms'),
          published: publishedDocument != null,
          publishedDocument,
        };
      }),
    );
  }

  async function writePublishedGuestSchedule(): Promise<void> {
    await departureRepository.markCompleted(new Date());
    const [catalog, departures] = await Promise.all([
      loadPublishedCatalogTours(store),
      departureRepository.listAllDepartures(),
    ]);
    const snapshotDepartures = guestScheduleDeparturesFromSnapshots(
      departures.map((departure) => ({
        tourId: departure.tourId,
        startsOn: isoDateOnly(departure.startsOn),
        seats: departure.seats,
        status: departure.status,
        publishedAt: isoTimestamp(departure.publishedAt),
        publishedStartsOn:
          departure.publishedStartsOn == null ? null : isoDateOnly(departure.publishedStartsOn),
        publishedSeats: departure.publishedSeats,
        publishedStatus: departure.publishedStatus,
      })),
    );
    const catalogIds = new Set(catalog.map((tour) => tour.id));
    const publishedTours = [...catalog];
    for (const tourId of new Set(snapshotDepartures.map((departure) => departure.tourId))) {
      if (catalogIds.has(tourId)) {
        continue;
      }
      const snapshot = await loadPublishedDocument(store, tourId);
      if (snapshot != null) {
        publishedTours.push(snapshot);
      }
    }
    const files = toGuestTourDataFiles(
      snapshotDepartures,
      publishedTours,
      vladivostokCalendarDate(),
      new Date().toISOString(),
    );
    await store.putJson(CMS_PUBLISHED_TOURS_LIST_KEY, files.toursList);
    await store.putJson(CMS_PUBLISHED_SCHEDULE_KEY, files.schedule);
  }

  async function inspectHiddenTourPublish(
    tourId: string,
    confirmDeleteFutureDepartures: boolean,
  ): Promise<
    | { ok: true; deleteIds: string[] }
    | { ok: false; error: string; leadCount?: number; departureCount?: number }
  > {
    const todayIso = vladivostokCalendarDate();
    const departures = (await departureRepository.listAllDepartures())
      .filter((departure) => departure.tourId === tourId)
      .map((departure) => ({
        id: departure.id,
        startsOn: isoDateOnly(departure.startsOn),
        status: departure.status,
      }));
    const crm = await loadCrmFile(store);
    const check = checkHideTourPublish({
      confirmDeleteFutureDepartures,
      departures,
      leads: crm.deals.map((deal) => ({
        tourId: deal.tourId,
        date: deal.date,
        status: deal.status,
      })),
      tourId,
      todayIso,
    });
    if (!check.ok) {
      return check.error === 'future_departures_have_leads'
        ? { ok: false, error: check.error, leadCount: check.leadCount }
        : { ok: false, error: check.error, departureCount: check.departureCount };
    }
    return { ok: true, deleteIds: check.deleteIds };
  }

  app.get('/api/cms/health', (c) => c.json({ ok: true }));

  app.post('/api/cms/login', async (c) => {
    await seedPromise;
    const parsed = loginBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const user = await authRepository.findUserByLogin(parsed.data.login);
    if (
      user == null ||
      !user.isActive ||
      !verifyCmsPassword(parsed.data.password, user.passwordHash)
    ) {
      return c.json({ error: 'invalid_credentials' }, 401);
    }
    const rawToken = createRawSessionToken();
    await authRepository.createSession({
      userId: user.id,
      tokenHash: hashSessionToken(rawToken),
      expiresAt: new Date(Date.now() + CMS_SESSION_TTL_MS),
    });
    setCookie(c, CMS_SESSION_COOKIE, rawToken, {
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: Math.floor(CMS_SESSION_TTL_MS / 1000),
      secure: env.cookieSecure,
    });
    return c.json({
      login: user.login,
      role: user.role,
      ...effectivePublishFlags(user),
    });
  });

  app.post('/api/cms/logout', async (c) => {
    const token = getCookie(c, CMS_SESSION_COOKIE);
    if (token != null && token.length > 0) {
      const found = await authRepository.findActiveSession(hashSessionToken(token), new Date());
      if (found != null) {
        await authRepository.revokeSession(found.session.id);
      }
    }
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
    const found = await authRepository.findActiveSession(hashSessionToken(token), new Date());
    if (found == null) {
      return c.json({ error: 'unauthorized' }, 401);
    }
    c.set('session', {
      sub: found.user.login,
      role: found.user.role,
      exp: found.session.expiresAt.getTime(),
      ...effectivePublishFlags(found.user),
    });
    await next();
  });

  app.get('/api/cms/me', (c) => {
    const session = c.get('session');
    return c.json(publicActor(session));
  });

  app.get('/api/cms/departures', async (c) => {
    const parsed = listDeparturesQuerySchema.safeParse({
      from: c.req.query('from'),
      to: c.req.query('to'),
      includeHistory: c.req.query('includeHistory'),
    });
    if (!parsed.success) {
      return c.json({ error: 'invalid_query' }, 400);
    }
    const departures = await departureRepository.listDepartures({
      from: parsed.data.from,
      to: parsed.data.to,
      includeHistory: parsed.data.includeHistory === 'true',
    });
    const { documents } = await listCmsTourDocumentsWithPublication(store);
    const titles = new Map(documents.map((tour) => [tour.id, tour.title] as const));
    return c.json({ departures: departures.map((departure) => publicDeparture(departure, titles.get(departure.tourId))) });
  });

  app.post('/api/cms/departures', async (c) => {
    const body = await readJsonBody(c);
    const parsed = createDepartureBodySchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: hasInvalidStartsOn(body) ? 'invalid_starts_on' : 'invalid_body' }, 400);
    }
    const userId = await actorUserId(authRepository, c.get('session'));
    if (userId == null) {
      return c.json({ error: 'unauthorized' }, 401);
    }
    try {
      const departure = await departureRepository.createDeparture({
        ...parsed.data,
        actorUserId: userId,
      });
      await departureRepository.markSubmitted([departure.id], new Date());
      return c.json(
        publicDeparture(await departureWithEndDate(departureRepository, departure)),
        201,
      );
    } catch (error: unknown) {
      const mapped = departureErrorResponse(error);
      if (mapped != null) {
        return c.json({ error: mapped.error }, mapped.status);
      }
      throw error;
    }
  });

  app.put('/api/cms/departures/:id', async (c) => {
    const body = await readJsonBody(c);
    const parsed = updateDepartureBodySchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: hasInvalidStartsOn(body) ? 'invalid_starts_on' : 'invalid_body' }, 400);
    }
    const userId = await actorUserId(authRepository, c.get('session'));
    if (userId == null) {
      return c.json({ error: 'unauthorized' }, 401);
    }
    try {
      const departure = await departureRepository.updateDeparture({
        id: c.req.param('id'),
        ...parsed.data,
        actorUserId: userId,
      });
      if (departure.status === 'cancelled') {
        if (departure.publishedAt == null) {
          await departureRepository.markUnsubmitted([departure.id]);
        } else {
          await departureRepository.markSubmitted([departure.id], new Date());
        }
      } else {
        await departureRepository.markSubmitted([departure.id], new Date());
      }
      return c.json(
        publicDeparture(await departureWithEndDate(departureRepository, departure)),
      );
    } catch (error: unknown) {
      const mapped = departureErrorResponse(error);
      if (mapped != null) {
        return c.json({ error: mapped.error }, mapped.status);
      }
      throw error;
    }
  });

  app.delete('/api/cms/departures/:id', async (c) => {
    const userId = await actorUserId(authRepository, c.get('session'));
    if (userId == null) {
      return c.json({ error: 'unauthorized' }, 401);
    }
    try {
      await departureRepository.deleteDeparture(c.req.param('id'));
      return c.body(null, 204);
    } catch (error: unknown) {
      if (error instanceof CmsDepartureNotFoundError) {
        return c.json({ error: 'not_found' }, 404);
      }
      const mapped = departureErrorResponse(error);
      if (mapped != null) {
        return c.json({ error: mapped.error }, mapped.status);
      }
      throw error;
    }
  });

  app.get('/api/cms/publish-queue', async (c) => {
    const tours = await loadQueueTours();
    const titles = new Map(tours.map((tour) => [tour.id, tour.title]));
    const logins = new Map(
      (await authRepository.listUsers()).map((user) => [user.id, user.login] as const),
    );
    const items = livePublishQueue(
      tours,
      (await departureRepository.listAllDepartures()).map((departure) => ({
        ...toQueueDeparture(departure),
        title: titles.get(departure.tourId),
        author: logins.get(departure.updatedBy),
      })),
    );
    return c.json({ items });
  });

  app.post('/api/cms/publish-queue/submit', async (c) => {
    const parsed = submitQueueBodySchema.safeParse((await readJsonBody(c)) ?? {});
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const now = new Date();
    const submittedAt = now.toISOString();
    const wantedTours = parsed.data.tourIds == null ? null : new Set(parsed.data.tourIds);
    const wantedDepartures =
      parsed.data.departureIds == null ? null : new Set(parsed.data.departureIds);

    const tours = await loadQueueTours();
    for (const tour of tours) {
      if (wantedTours != null && !wantedTours.has(tour.id)) {
        continue;
      }
      await persistDraft(store, tour.id, tour.document, {
        ...tour.meta,
        submittedForPublishAt: submittedAt,
        returnReason: null,
      });
    }

    const departures = (await departureRepository.listAllDepartures()).map(toQueueDeparture);
    const departureIds = departures.flatMap((departure) => {
      if (wantedDepartures != null && !wantedDepartures.has(departure.id)) {
        return [];
      }
      return departureNeedsPublication(departure) ? [departure.id] : [];
    });
    await departureRepository.markSubmitted(departureIds, now);
    return c.json({ ok: true });
  });

  app.post('/api/cms/publish-queue/return', async (c) => {
    const session = c.get('session');
    const parsed = z
      .object({
        reason: z.string().trim().min(1).max(280),
        tourIds: z.array(z.string().min(1)).optional(),
        departureIds: z.array(z.string().min(1)).optional(),
      })
      .refine((value) => (value.tourIds?.length ?? 0) + (value.departureIds?.length ?? 0) > 0)
      .safeParse((await readJsonBody(c)) ?? {});
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    if (session.role !== 'admin') {
      return c.json({ error: 'forbidden' }, 403);
    }
    if (
      (parsed.data.tourIds != null && parsed.data.tourIds.length > 0 && !session.canPublishTours) ||
      (parsed.data.departureIds != null &&
        parsed.data.departureIds.length > 0 &&
        !session.canPublishSchedule)
    ) {
      return c.json({ error: 'forbidden' }, 403);
    }
    const wantedTours = parsed.data.tourIds == null ? new Set<string>() : new Set(parsed.data.tourIds);
    const tours = await loadQueueTours();
    for (const tour of tours) {
      if (!wantedTours.has(tour.id)) {
        continue;
      }
      await persistDraft(store, tour.id, tour.document, {
        ...tour.meta,
        submittedForPublishAt: null,
        returnReason: parsed.data.reason,
      });
    }
    await departureRepository.markUnsubmitted(parsed.data.departureIds ?? []);
    return c.json({ ok: true });
  });

  app.post('/api/cms/publish-queue/publish', async (c) => {
    const session = c.get('session');
    const parsed = submitQueueBodySchema.safeParse((await readJsonBody(c)) ?? {});
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const queue = livePublishQueue(
      await loadQueueTours(),
      (await departureRepository.listAllDepartures()).map(toQueueDeparture),
    );
    const tourIds =
      parsed.data.tourIds ?? queue.filter((item) => item.kind === 'tour').map((item) => item.id);
    const departureIds =
      parsed.data.departureIds ??
      queue.filter((item) => item.kind === 'departure').map((item) => item.id);
    if (tourIds.length > 0 && !session.canPublishTours) {
      return c.json({ error: 'forbidden' }, 403);
    }
    if (departureIds.length > 0 && !session.canPublishSchedule) {
      return c.json({ error: 'forbidden' }, 403);
    }
    const prepared: Array<{
      tourId: string;
      toPublish: CmsTourDocument;
      meta: Awaited<ReturnType<typeof loadMeta>>;
    }> = [];
    const hideDeleteIds: string[] = [];
    let skippedBlocker: { tourId: string; error: string; blockers: string[] } | null = null;
    let skippedLeads: {
      tourId: string;
      leadCount?: number;
      departureCount?: number;
    } | null = null;
    for (const tourId of tourIds) {
      const document = await loadDraftOrPublished(store, tourId);
      if (document == null) {
        return c.json({ error: 'not_found', tourId }, 404);
      }
      const publishedDocument = await loadPublishedDocument(store, tourId);
      const blockers = cmsPublishBlockersForIntent(document, {
        hasPublishedSnapshot: publishedDocument != null,
      });
      if (blockers.length > 0) {
        skippedBlocker ??= { tourId, error: blockers[0], blockers };
        continue;
      }
      const toPublish = documentToPublishForQueue(document, publishedDocument);
      if (toPublish.status === 'hidden') {
        const hide = await inspectHiddenTourPublish(
          tourId,
          parsed.data.confirmDeleteFutureDepartures === true,
        );
        if (!hide.ok) {
          if (hide.error === 'future_departures_have_leads') {
            skippedLeads ??= {
              tourId,
              ...(hide.leadCount != null ? { leadCount: hide.leadCount } : {}),
              ...(hide.departureCount != null ? { departureCount: hide.departureCount } : {}),
            };
            continue;
          }
          return c.json(
            {
              error: hide.error,
              tourId,
              ...(hide.leadCount != null ? { leadCount: hide.leadCount } : {}),
              ...(hide.departureCount != null ? { departureCount: hide.departureCount } : {}),
            },
            400,
          );
        }
        hideDeleteIds.push(...hide.deleteIds);
      }
      prepared.push({
        tourId,
        toPublish,
        meta: await loadMeta(store, tourId, session.sub),
      });
      const expectedRev = parsed.data.tourRevs?.[tourId];
      if (expectedRev != null && expectedRev !== prepared[prepared.length - 1]?.meta.rev) {
        return c.json(
          { error: 'rev_conflict', rev: prepared[prepared.length - 1]?.meta.rev, tourId },
          409,
        );
      }
    }
    if (prepared.length === 0) {
      if (skippedLeads != null) {
        return c.json(
          {
            error: 'future_departures_have_leads',
            tourId: skippedLeads.tourId,
            ...(skippedLeads.leadCount != null ? { leadCount: skippedLeads.leadCount } : {}),
            ...(skippedLeads.departureCount != null
              ? { departureCount: skippedLeads.departureCount }
              : {}),
          },
          400,
        );
      }
      if (skippedBlocker != null) {
        return c.json(
          {
            error: skippedBlocker.error,
            blockers: skippedBlocker.blockers,
            tourId: skippedBlocker.tourId,
          },
          400,
        );
      }
    }
    for (const item of prepared) {
      const currentMeta = await loadMeta(store, item.tourId, session.sub);
      if (currentMeta.rev !== item.meta.rev) {
        return c.json({ error: 'rev_conflict', rev: currentMeta.rev, tourId: item.tourId }, 409);
      }
      await persistDraft(
        store,
        item.tourId,
        item.toPublish,
        createCmsTourMeta({
          rev: item.meta.rev + 1,
          editor: session.sub,
          submittedForPublishAt: null,
          returnReason: null,
        }),
      );
      await publishToCatalog(store, item.tourId, item.toPublish);
    }
    for (const departureId of hideDeleteIds) {
      await departureRepository.deleteDeparture(departureId, { allowPublished: true });
    }
    if (departureIds.length > 0) {
      const publishedTourIds = new Set(
        (await loadPublishedCatalogTours(store)).map((tour) => tour.id),
      );
      const byId = new Map(
        (await departureRepository.listAllDepartures()).map((departure) => [departure.id, departure]),
      );
      const publishable = departureIds.filter((id) => {
        const departure = byId.get(id);
        return departure != null && publishedTourIds.has(departure.tourId);
      });
      await departureRepository.markPublished(publishable, new Date());
    }
    await writePublishedGuestSchedule();
    return c.json({ ok: true });
  });

  app.post('/api/cms/departures/publish', async (c) => {
    const session = c.get('session');
    if (!session.canPublishSchedule) {
      return c.json({ error: 'forbidden' }, 403);
    }
    const parsed = publishDeparturesBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const allDepartures = await departureRepository.listAllDepartures();
    const publishedTourIds = new Set(
      (await loadPublishedCatalogTours(store)).map((tour) => tour.id),
    );
    const selectedIds =
      parsed.data.allEligible === true
        ? allDepartures
            .filter(
              (departure) =>
                publishedTourIds.has(departure.tourId) &&
                departureNeedsPublication(toQueueDeparture(departure)),
            )
            .map((departure) => departure.id)
        : (parsed.data.ids ?? []);
    const byId = new Map(allDepartures.map((departure) => [departure.id, departure]));
    const selected = selectedIds.map((id) => byId.get(id));
    if (parsed.data.allEligible !== true && selected.some((departure) => departure == null)) {
      return c.json({ error: 'not_found' }, 404);
    }
    if (selected.some((departure) => departure != null && !publishedTourIds.has(departure.tourId))) {
      return c.json({ error: 'tour_not_published' }, 400);
    }
    if (selectedIds.length > 0) {
      await departureRepository.markPublished(selectedIds, new Date());
    }
    await writePublishedGuestSchedule();
    return c.json({ ok: true });
  });

  app.get('/api/cms/tours', async (c) => {
    const { documents, publishedById } = await listCmsTourDocumentsWithPublication(store);
    const tours = sortCmsTourSummaries(documents);
    return c.json({
      tours: await Promise.all(
        tours.map(async (tour) => {
          const readiness = tourReadinessCounts(tour);
          const meta = await loadMeta(store, tour.id, 'cms');
          return {
            id: tour.id,
            title: tour.title,
            season: tour.season,
            status: tour.status,
            published: publishedById.has(tour.id),
            publishedStatus: publishedById.get(tour.id)?.status ?? null,
            slug: tour.slug,
            imageUrl: cmsTourCoverUrl(tour),
            ready: readiness.ready,
            readyCount: readiness.readyCount,
            readyTotal: readiness.readyTotal,
            readiness: tourReadiness(tour),
            returnReason: meta.returnReason ?? null,
          };
        }),
      ),
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
    const meta = createCmsTourMeta({
      editor: session.sub,
      submittedForPublishAt: new Date().toISOString(),
    });
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
    const publishedDocument = await loadPublishedDocument(store, tourId);
    return c.json({
      document,
      meta,
      published: publishedDocument != null,
      publishedStatus: publishedDocument?.status ?? null,
    });
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
      if (parsed.data.status != null) {
        nextDocument = cmsTourDocumentSchema.parse({
          ...nextDocument,
          status: parsed.data.status,
        });
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

    const publishedDocument = await loadPublishedDocument(store, tourId);
    const nextMeta = nextDraftMeta(meta, session.sub, nextDocument, publishedDocument);
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
    const publishedDocument = await loadPublishedDocument(store, tourId);
    const nextMeta = nextDraftMeta(meta, session.sub, nextDocument, publishedDocument);
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
    const publishedDocument = await loadPublishedDocument(store, tourId);
    const nextMeta = nextDraftMeta(meta, session.sub, nextDocument, publishedDocument);
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
    if (!session.canPublishTours) {
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
    const publishedDocument = await loadPublishedDocument(store, tourId);
    const blockers = cmsPublishBlockersForIntent(document, {
      hasPublishedSnapshot: publishedDocument != null,
    });
    if (blockers.length > 0) {
      return c.json({ error: blockers[0], blockers }, 400);
    }
    const toPublish = documentToPublishForQueue(document, publishedDocument);
    let hideDeleteIds: string[] = [];
    if (toPublish.status === 'hidden') {
      const hide = await inspectHiddenTourPublish(
        tourId,
        parsed.data.confirmDeleteFutureDepartures === true,
      );
      if (!hide.ok) {
        return c.json(
          {
            error: hide.error,
            ...(hide.leadCount != null ? { leadCount: hide.leadCount } : {}),
            ...(hide.departureCount != null ? { departureCount: hide.departureCount } : {}),
          },
          400,
        );
      }
      hideDeleteIds = hide.deleteIds;
    }
    const nextMeta = createCmsTourMeta({
      rev: meta.rev + 1,
      editor: session.sub,
      submittedForPublishAt: null,
    });
    await persistDraft(store, tourId, toPublish, nextMeta);
    await publishToCatalog(store, tourId, toPublish);
    for (const departureId of hideDeleteIds) {
      await departureRepository.deleteDeparture(departureId, { allowPublished: true });
    }
    await writePublishedGuestSchedule();
    return c.json({ document: toPublish, meta: nextMeta });
  });

  app.get('/api/cms/users', async (c) => {
    if (c.get('session').role !== 'admin') {
      return c.json({ error: 'forbidden' }, 403);
    }
    return c.json({ users: publicAuthUsers(await authRepository.listUsers()) });
  });

  app.post('/api/cms/users', async (c) => {
    if (c.get('session').role !== 'admin') {
      return c.json({ error: 'forbidden' }, 403);
    }
    const parsed = createUserBodySchema.safeParse(await readJsonBody(c));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    if ((await authRepository.findUserByLogin(parsed.data.login)) != null) {
      return c.json({ error: 'login_taken' }, 409);
    }
    await authRepository.createUser({
      login: parsed.data.login,
      passwordHash: hashCmsPassword(parsed.data.password),
      role: parsed.data.role,
    });
    return c.json({ users: publicAuthUsers(await authRepository.listUsers()) }, 201);
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
    if (
      parsed.data.role == null &&
      parsed.data.password == null &&
      parsed.data.canPublishTours == null &&
      parsed.data.canPublishSchedule == null
    ) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const current = await authRepository.findUserByLogin(login);
    if (current == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    try {
      await authRepository.updateUser(current.id, {
        ...(parsed.data.role != null ? { role: parsed.data.role } : {}),
        ...(parsed.data.password != null
          ? { passwordHash: hashCmsPassword(parsed.data.password) }
          : {}),
        ...(parsed.data.canPublishTours != null
          ? { canPublishTours: parsed.data.canPublishTours }
          : {}),
        ...(parsed.data.canPublishSchedule != null
          ? { canPublishSchedule: parsed.data.canPublishSchedule }
          : {}),
      });
    } catch (error: unknown) {
      if (error instanceof CmsLastAdminError) {
        return c.json({ error: 'last_admin' }, 409);
      }
      throw error;
    }
    return c.json({ users: publicAuthUsers(await authRepository.listUsers()) });
  });

  app.delete('/api/cms/users/:login', async (c) => {
    const session = c.get('session');
    if (session.role !== 'admin') {
      return c.json({ error: 'forbidden' }, 403);
    }
    const login = c.req.param('login');
    const current = await authRepository.findUserByLogin(login);
    if (current == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const actor = await authRepository.findUserByLogin(session.sub);
    if (actor != null && actor.id === current.id) {
      return c.json({ error: 'cannot_delete_self' }, 409);
    }
    try {
      await authRepository.deleteUser(current.id);
    } catch (error: unknown) {
      if (error instanceof CmsLastAdminError) {
        return c.json({ error: 'last_admin' }, 409);
      }
      throw error;
    }
    return c.json({ users: publicAuthUsers(await authRepository.listUsers()) });
  });

  registerCrmRoutes(app, store, env);

  return app;
}
