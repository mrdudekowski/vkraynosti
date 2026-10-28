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

export async function collectRewriteCandidateKeys(
  store: Pick<CmsJsonStore, 'getJson'>,
): Promise<string[]> {
  const keys = new Set<string>([CMS_PUBLISHED_CATALOG_KEY, CMS_DRAFT_INDEX_KEY]);
  const catalogRaw = await store.getJson(CMS_PUBLISHED_CATALOG_KEY);
  const indexRaw = await store.getJson(CMS_DRAFT_INDEX_KEY);
  const ids = new Set<string>();
  if (catalogRaw != null) {
    try {
      for (const tour of parseCmsToursFile(catalogRaw).tours) {
        ids.add(tour.id);
      }
    } catch {
      // ignore invalid catalog during key collection
    }
  }
  if (indexRaw != null) {
    try {
      for (const id of parseCmsDraftIndex(indexRaw)) {
        ids.add(id);
      }
    } catch {
      // ignore invalid draft index during key collection
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
  return [...keys];
}

export type PublicMediaOriginRewriteResult = {
  scanned: number;
  changedKeys: string[];
  replacements: number;
};

export async function rewritePublicMediaOriginKeys(
  store: CmsJsonStore,
  options: { from: string; to: string; dryRun: boolean },
): Promise<PublicMediaOriginRewriteResult> {
  const keys = await collectRewriteCandidateKeys(store);
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
  };
}
