import {
  CMS_DRAFT_INDEX_KEY,
  CMS_PUBLISHED_CATALOG_KEY,
  cmsDraftDocumentKey,
  cmsDraftMetaKey,
  cmsMediaObjectKeyFromPublicUrl,
  cmsPublishedDocumentKey,
} from '../../../src/cms/cmsPackageKeys.ts';
import { cmsDraftIndexFile, parseCmsDraftIndex } from '../../../src/cms/cmsDraftIndex.ts';
import { parseCmsToursFile, type CmsTourDocument } from '../../../src/cms/cmsTourDocument.ts';
import type { CmsJsonStore } from './store.ts';

function mediaKeysForTour(tour: CmsTourDocument): string[] {
  const keys = new Set<string>();
  for (const asset of tour.assets) {
    for (const url of [asset.stillUrl, asset.videoUrl]) {
      if (url == null || url.length === 0) {
        continue;
      }
      const key = cmsMediaObjectKeyFromPublicUrl(tour.id, url);
      if (key != null) {
        keys.add(key);
      }
    }
  }
  return [...keys];
}

async function removeFromDraftIndex(store: CmsJsonStore, tourId: string): Promise<void> {
  const raw = await store.getJson(CMS_DRAFT_INDEX_KEY);
  if (raw == null) {
    return;
  }
  await store.putJson(
    CMS_DRAFT_INDEX_KEY,
    cmsDraftIndexFile(parseCmsDraftIndex(raw).filter((id) => id !== tourId)),
  );
}

async function removeFromPublishedCatalog(store: CmsJsonStore, tourId: string): Promise<void> {
  const raw = await store.getJson(CMS_PUBLISHED_CATALOG_KEY);
  if (raw == null) {
    return;
  }
  const catalog = parseCmsToursFile(raw);
  await store.putJson(CMS_PUBLISHED_CATALOG_KEY, {
    ...catalog,
    tours: catalog.tours.filter((tour) => tour.id !== tourId),
  });
}

export async function deleteCmsTour(store: CmsJsonStore, tour: CmsTourDocument): Promise<void> {
  await removeFromDraftIndex(store, tour.id);
  await removeFromPublishedCatalog(store, tour.id);
  await Promise.all([
    store.deleteJson(cmsDraftDocumentKey(tour.id)),
    store.deleteJson(cmsDraftMetaKey(tour.id)),
    store.deleteJson(cmsPublishedDocumentKey(tour.id)),
    ...mediaKeysForTour(tour).map((key) => store.deleteBytes(key)),
  ]);
}
