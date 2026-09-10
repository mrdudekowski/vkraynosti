import { cmsPublishBlockers } from '../../src/cms/cmsPublishRules.ts';
import { parseCmsDraftIndex } from '../../src/cms/cmsDraftIndex.ts';
import {
  CMS_DRAFT_INDEX_KEY,
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
  cmsDraftDocumentKey,
  cmsDraftMetaKey,
  cmsPublishedDocumentKey,
} from '../../src/cms/cmsPackageKeys.ts';
import { cmsTourDocumentSchema, parseCmsToursFile, type CmsTourDocument } from '../../src/cms/cmsTourDocument.ts';
import { parseCmsTourMeta } from '../../src/cms/cmsTourMeta.ts';
import { resolvePublishedTourDocument } from '../../src/cms/publishedTourSnapshot.ts';
import { isTourReady } from '../../src/cms/tourCompleteness.ts';
import { livePublishQueue } from '../../src/cms/publishQueue.ts';
import { adminTourLiveVisibility } from '../../src/admin/tourLiveVisibility.ts';
import { loadCmsApiEnv } from './api/env.ts';
import { createCmsJsonStore } from './api/store.ts';

function firstDiffKey(left: unknown, right: unknown, prefix = ''): string | null {
  if (left === right) {
    return null;
  }
  if (typeof left !== 'object' || typeof right !== 'object' || left == null || right == null) {
    return prefix || '(root)';
  }
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const keys = [...new Set([...Object.keys(leftRecord), ...Object.keys(rightRecord)])].sort();
  for (const key of keys) {
    const pathKey = prefix.length === 0 ? key : `${prefix}.${key}`;
    if (!(key in leftRecord) || !(key in rightRecord)) {
      return pathKey;
    }
    const nested = firstDiffKey(leftRecord[key], rightRecord[key], pathKey);
    if (nested != null) {
      return nested;
    }
  }
  return null;
}

const rootDir = process.cwd();
const env = await loadCmsApiEnv(rootDir);
const store = createCmsJsonStore(env);

const catalogRaw = await store.getJson(CMS_PUBLISHED_CATALOG_KEY);
const catalog = catalogRaw == null ? { tours: [] as CmsTourDocument[] } : parseCmsToursFile(catalogRaw);
const overlayById = new Map(catalog.tours.map((tour) => [tour.id, tour]));
const draftIndexRaw = await store.getJson(CMS_DRAFT_INDEX_KEY);
const draftIds = draftIndexRaw == null ? [] : parseCmsDraftIndex(draftIndexRaw);
const ids = [...new Set([...catalog.tours.map((tour) => tour.id), ...draftIds])].sort();

const guestListRaw = await store.getJson(CMS_PUBLISHED_TOURS_LIST_KEY);
const guestList = guestListRaw as { tours?: Array<{ id: string; title?: string }> } | null;
const guestIds = new Set((guestList?.tours ?? []).map((tour) => tour.id));

const queueTours = [];
const rows: Array<Record<string, unknown>> = [];

for (const id of ids) {
  const draftRaw = await store.getJson(cmsDraftDocumentKey(id));
  const draft = draftRaw == null ? null : cmsTourDocumentSchema.parse(draftRaw);
  const perTourRaw = await store.getJson(cmsPublishedDocumentKey(id));
  const perTour = perTourRaw == null ? null : cmsTourDocumentSchema.parse(perTourRaw);
  const published = resolvePublishedTourDocument(perTour, overlayById.get(id));
  const document = draft ?? published;
  if (document == null) {
    continue;
  }
  const metaRaw = await store.getJson(cmsDraftMetaKey(id));
  const meta = metaRaw == null ? null : parseCmsTourMeta(metaRaw);
  const publishedFlag = published != null;
  const live = adminTourLiveVisibility({
    status: document.status,
    published: publishedFlag,
    publishedStatus: published?.status ?? null,
  });
  const stringifyDiff =
    published == null || draft == null
      ? published == null
        ? 'no-snapshot'
        : 'no-draft'
      : JSON.stringify(draft) === JSON.stringify(published)
        ? null
        : firstDiffKey(draft, published);
  const blockers = cmsPublishBlockers(document);
  queueTours.push({
    id: document.id,
    title: document.title,
    document,
    meta: meta ?? { rev: 1, updatedAt: '', editor: 'inspect' },
    published: publishedFlag,
    publishedDocument: published,
  });
  rows.push({
    id,
    title: document.title,
    draftStatus: draft?.status ?? null,
    publishedStatus: published?.status ?? null,
    live,
    onGuestList: guestIds.has(id),
    ready: isTourReady(document),
    blockers,
    stringifyDiff,
    returnReason: meta?.returnReason ?? null,
    submitted: meta?.submittedForPublishAt ?? null,
    rev: meta?.rev ?? null,
  });
}

const queue = livePublishQueue(queueTours, []);
const willHide = rows.filter((row) => row.live === 'will_hide');
const drafts = rows.filter((row) => row.live === 'draft');
const krabbe = rows.filter((row) => String(row.title).toLowerCase().includes('краббе') || String(row.id).includes('summer-8'));

console.info(JSON.stringify({
  counts: {
    tours: rows.length,
    guestList: guestIds.size,
    catalog: catalog.tours.length,
    willHide: willHide.length,
    draft: drafts.length,
    queueTours: queue.length,
  },
  krabbe,
  willHide,
  drafts,
  queue: queue.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    ready: item.ready,
    status: item.status,
    publishedStatus: item.publishedStatus,
  })),
}, null, 2));
