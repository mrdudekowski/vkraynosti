import {
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
  cmsPublishedDocumentKey,
} from '../../../src/cms/cmsPackageKeys.ts';
import { SITE_CONTENT_KINDS, siteContentPublishedKey } from '../../../src/cms/siteContentPackageKeys.ts';
import { setPublishedSyncState } from './publishedSyncState.ts';
import type { CmsJsonStore } from './store.ts';

const TOUR_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export type PublishedJsonSyncStatus = 'match' | 'differ' | 'missing-in-db' | 'missing-in-s3';

export type PublishedJsonSyncRow = {
  key: string;
  status: PublishedJsonSyncStatus;
  repaired: boolean;
};

type PublishedJsonReader = Pick<CmsJsonStore, 'getJson'>;
type PublishedJsonWriter = Pick<CmsJsonStore, 'getJson' | 'putJson'>;

export function sameStoredJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function publishedJsonSyncStatus(
  dbValue: unknown | null,
  s3Value: unknown | null,
): PublishedJsonSyncStatus {
  if (dbValue == null && s3Value == null) return 'match';
  if (dbValue == null) return 'missing-in-db';
  if (s3Value == null) return 'missing-in-s3';
  return sameStoredJson(dbValue, s3Value) ? 'match' : 'differ';
}

function tourIds(catalog: unknown): string[] {
  if (catalog == null || typeof catalog !== 'object' || !('tours' in catalog)) return [];
  const tours = (catalog as { tours: unknown }).tours;
  if (!Array.isArray(tours)) return [];
  return tours.flatMap((tour) => {
    if (tour == null || typeof tour !== 'object' || !('id' in tour)) return [];
    const id = (tour as { id: unknown }).id;
    return typeof id === 'string' && TOUR_ID_PATTERN.test(id) ? [id] : [];
  });
}

export function publishedSyncKeys(dbCatalog: unknown, s3Catalog: unknown): string[] {
  const ids = [...new Set([...tourIds(dbCatalog), ...tourIds(s3Catalog)])];
  return [
    CMS_PUBLISHED_CATALOG_KEY,
    CMS_PUBLISHED_TOURS_LIST_KEY,
    CMS_PUBLISHED_SCHEDULE_KEY,
    ...SITE_CONTENT_KINDS.map((kind) => siteContentPublishedKey(kind)),
    ...ids.map((id) => cmsPublishedDocumentKey(id)),
  ];
}

async function readSyncRows(
  db: PublishedJsonReader,
  s3: PublishedJsonReader,
): Promise<Array<PublishedJsonSyncRow & { dbValue: unknown | null; s3Value: unknown | null }>> {
  const dbCatalog = await db.getJson(CMS_PUBLISHED_CATALOG_KEY);
  const s3Catalog = await s3.getJson(CMS_PUBLISHED_CATALOG_KEY);
  const keys = publishedSyncKeys(dbCatalog, s3Catalog);
  const rows = [];
  for (const key of keys) {
    const dbValue = key === CMS_PUBLISHED_CATALOG_KEY ? dbCatalog : await db.getJson(key);
    const s3Value = key === CMS_PUBLISHED_CATALOG_KEY ? s3Catalog : await s3.getJson(key);
    rows.push({
      key,
      status: publishedJsonSyncStatus(dbValue, s3Value),
      repaired: false,
      dbValue,
      s3Value,
    });
  }
  return rows;
}

function rememberSync(rows: readonly PublishedJsonSyncRow[]): void {
  setPublishedSyncState(rows.some((row) => row.status === 'differ') ? 'drift' : 'match');
}

export async function comparePublishedJson(
  db: PublishedJsonReader,
  s3: PublishedJsonReader,
): Promise<PublishedJsonSyncRow[]> {
  const rows = await readSyncRows(db, s3);
  const report = rows.map(({ key, status, repaired }) => ({ key, status, repaired }));
  rememberSync(report);
  return report;
}

export async function reconcilePublishedJson(
  db: PublishedJsonWriter,
  s3: PublishedJsonWriter,
): Promise<PublishedJsonSyncRow[]> {
  const rows = await readSyncRows(db, s3);
  const report: PublishedJsonSyncRow[] = [];
  for (const row of rows) {
    let repaired = false;
    if (row.status === 'missing-in-db' && row.s3Value != null) {
      await db.putJson(row.key, row.s3Value);
      repaired = true;
    } else if (row.status === 'missing-in-s3' && row.dbValue != null) {
      await s3.putJson(row.key, row.dbValue);
      repaired = true;
    }
    report.push({ key: row.key, status: row.status, repaired });
  }
  rememberSync(report);
  return report;
}
