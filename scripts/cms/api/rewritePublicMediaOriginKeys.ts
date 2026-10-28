import { parseCmsDraftIndex } from '../../../src/cms/cmsDraftIndex.ts';
import {
  CMS_DRAFT_INDEX_KEY,
  CMS_PUBLISHED_CATALOG_KEY,
  cmsDraftDocumentKey,
  cmsPublishedDocumentKey,
} from '../../../src/cms/cmsPackageKeys.ts';
import { parseCmsToursFile } from '../../../src/cms/cmsTourDocument.ts';
import { replacePublicMediaOrigin } from '../../../src/cms/replacePublicMediaOrigin.ts';
import {
  SITE_CONTENT_KINDS,
  siteContentDraftKey,
  siteContentPublishedKey,
} from '../../../src/cms/siteContentPackageKeys.ts';
import type { CmsJsonStore } from './store.ts';

export const DEFAULT_LEGACY_S3_PUBLIC_ORIGIN = 'https://s3.twcstorage.ru/vkraynosti-cms-dev';
export const DEFAULT_CDN_PUBLIC_ORIGIN = 'https://ypnmfvotln.cdn.twcstorage.ru';

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

export function normalizePublicMediaOriginPrefix(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') {
    return null;
  }
  if (url.search.length > 0 || url.hash.length > 0) {
    return null;
  }
  const pathSegments = url.pathname.split('/').filter((segment) => segment.length > 0);
  if (pathSegments.length > 1) {
    return null;
  }
  const normalized = stripTrailingSlashes(trimmed);
  if (normalized.length === 0 || !normalized.startsWith('https://')) {
    return null;
  }
  return normalized;
}

function lenientTourIdsFromCatalogRaw(raw: unknown): string[] {
  if (raw == null || typeof raw !== 'object' || !('tours' in raw)) {
    return [];
  }
  const tours = (raw as { tours?: unknown }).tours;
  if (!Array.isArray(tours)) {
    return [];
  }
  const ids: string[] = [];
  for (const tour of tours) {
    if (tour == null || typeof tour !== 'object' || !('id' in tour)) {
      continue;
    }
    const id = (tour as { id?: unknown }).id;
    if (typeof id === 'string' && id.length > 0) {
      ids.push(id);
    }
  }
  return ids;
}

function lenientTourIdsFromDraftIndexRaw(raw: unknown): string[] {
  if (raw == null || typeof raw !== 'object' || !('tourIds' in raw)) {
    return [];
  }
  const tourIds = (raw as { tourIds?: unknown }).tourIds;
  if (!Array.isArray(tourIds)) {
    return [];
  }
  return tourIds.filter((id): id is string => typeof id === 'string' && id.length > 0);
}

function tourIdsFromCatalogRaw(
  catalogRaw: unknown,
  warnings: string[],
): string[] {
  try {
    return parseCmsToursFile(catalogRaw).tours.map((tour) => tour.id);
  } catch {
    const lenientIds = lenientTourIdsFromCatalogRaw(catalogRaw);
    if (lenientIds.length > 0) {
      warnings.push(
        `${CMS_PUBLISHED_CATALOG_KEY}: schema validation failed; extracted ${lenientIds.length} tour id(s) leniently`,
      );
      return lenientIds;
    }
    warnings.push(
      `${CMS_PUBLISHED_CATALOG_KEY}: schema validation failed; no tour ids extracted`,
    );
    return [];
  }
}

function tourIdsFromDraftIndexRaw(indexRaw: unknown, warnings: string[]): string[] {
  try {
    return parseCmsDraftIndex(indexRaw);
  } catch {
    const lenientIds = lenientTourIdsFromDraftIndexRaw(indexRaw);
    if (lenientIds.length > 0) {
      warnings.push(
        `${CMS_DRAFT_INDEX_KEY}: schema validation failed; extracted ${lenientIds.length} tour id(s) leniently`,
      );
      return lenientIds;
    }
    warnings.push(`${CMS_DRAFT_INDEX_KEY}: schema validation failed; no tour ids extracted`);
    return [];
  }
}

export type CollectRewriteCandidateKeysResult = {
  keys: string[];
  warnings: string[];
};

export async function collectRewriteCandidateKeys(
  store: Pick<CmsJsonStore, 'getJson'>,
): Promise<CollectRewriteCandidateKeysResult> {
  const keys = new Set<string>([CMS_PUBLISHED_CATALOG_KEY, CMS_DRAFT_INDEX_KEY]);
  const warnings: string[] = [];
  const catalogRaw = await store.getJson(CMS_PUBLISHED_CATALOG_KEY);
  const indexRaw = await store.getJson(CMS_DRAFT_INDEX_KEY);
  const ids = new Set<string>();
  if (catalogRaw != null) {
    for (const id of tourIdsFromCatalogRaw(catalogRaw, warnings)) {
      ids.add(id);
    }
  }
  if (indexRaw != null) {
    for (const id of tourIdsFromDraftIndexRaw(indexRaw, warnings)) {
      ids.add(id);
    }
  }
  for (const id of ids) {
    keys.add(cmsDraftDocumentKey(id));
    keys.add(cmsPublishedDocumentKey(id));
  }
  for (const kind of SITE_CONTENT_KINDS) {
    keys.add(siteContentPublishedKey(kind));
    keys.add(siteContentDraftKey(kind));
  }
  return { keys: [...keys], warnings };
}

export type PublicMediaOriginRewriteResult = {
  scanned: number;
  changedKeys: string[];
  replacements: number;
  warnings: string[];
};

export async function rewritePublicMediaOriginKeys(
  store: CmsJsonStore,
  options: { from: string; to: string; dryRun: boolean },
): Promise<PublicMediaOriginRewriteResult> {
  const { keys, warnings } = await collectRewriteCandidateKeys(store);
  const changes: Array<{ key: string; value: unknown; replacements: number }> = [];
  let replacements = 0;

  for (const key of keys) {
    const original = await store.getJson(key);
    if (original == null) {
      continue;
    }
    const rewritten = replacePublicMediaOrigin(original, options.from, options.to);
    if (rewritten.replacements === 0) {
      continue;
    }
    replacements += rewritten.replacements;
    changes.push({ key, value: rewritten.value, replacements: rewritten.replacements });
  }

  if (!options.dryRun && changes.length > 0) {
    const ordered = [...changes].sort((left, right) => {
      if (left.key === CMS_PUBLISHED_CATALOG_KEY) {
        return 1;
      }
      if (right.key === CMS_PUBLISHED_CATALOG_KEY) {
        return -1;
      }
      return left.key.localeCompare(right.key);
    });
    for (const change of ordered) {
      await store.putJson(change.key, change.value);
    }
  }

  return {
    scanned: keys.length,
    changedKeys: changes.map((change) => change.key),
    replacements,
    warnings,
  };
}
