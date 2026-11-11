import { parseCmsToursFile, type CmsToursFile } from './cmsTourDocument';
import { assertPublicSnapshotToursProjection } from './publicSnapshotRelease';
import { cmsPublishedCatalogCandidates } from './cmsContentUrls';
import { loadEmbeddedPublicSnapshot } from './loadEmbeddedPublicSnapshot';

export type CmsCatalogSource = 'bake';

export type CmsCatalogLoad = { file: CmsToursFile; source: CmsCatalogSource };

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS tours fetch failed: ${response.status} ${url}`);
  }
  return response.json() as Promise<unknown>;
}

export async function loadCmsToursFile(): Promise<CmsCatalogLoad | null> {
  for (const url of cmsPublishedCatalogCandidates()) {
    try {
      const release = await loadEmbeddedPublicSnapshot();
      if (release == null) return null;
      const toursInput = await fetchJson(url);
      const file = parseCmsToursFile(toursInput);
      assertPublicSnapshotToursProjection(release, file);
      return { file, source: 'bake' };
    } catch (error) {
      console.warn('[cms] Failed to load tours from', url, error);
    }
  }
  return null;
}
