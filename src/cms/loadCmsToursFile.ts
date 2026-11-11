import { parseCmsToursFile, type CmsToursFile } from './cmsTourDocument';
import { assertPublicSnapshotToursProjection } from './publicSnapshotRelease';
import { cmsPublishedCatalogCandidates } from './cmsContentUrls';
import { loadEmbeddedPublicSnapshot } from './loadEmbeddedPublicSnapshot';

export type CmsCatalogSource = 'bake' | 'snapshot';

export type CmsCatalogLoad = { file: CmsToursFile; source: CmsCatalogSource };

async function fetchJson(url: string, releaseId: string): Promise<unknown> {
  const separator = url.includes('?') ? '&' : '?';
  const versionedUrl = url + separator + 'releaseId=' + encodeURIComponent(releaseId);
  const response = await fetch(versionedUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('CMS tours fetch failed: ' + response.status + ' ' + versionedUrl);
  }
  return response.json() as Promise<unknown>;
}

export async function loadCmsToursFile(): Promise<CmsCatalogLoad | null> {
  let release: Awaited<ReturnType<typeof loadEmbeddedPublicSnapshot>>;
  try {
    release = await loadEmbeddedPublicSnapshot();
  } catch (error) {
    console.warn('[cms] Failed to load embedded public snapshot', error);
    return null;
  }
  if (release == null) return null;

  const snapshotFile = parseCmsToursFile(release.payload.tours);
  for (const url of cmsPublishedCatalogCandidates()) {
    try {
      const toursInput = await fetchJson(url, release.manifest.releaseId);
      const file = parseCmsToursFile(toursInput);
      assertPublicSnapshotToursProjection(release, file);
      return { file, source: 'bake' };
    } catch (error) {
      console.warn('[cms] Failed to load baked tours from', url, error);
    }
  }

  console.warn('[cms] Using embedded release snapshot for the tour catalog');
  return { file: snapshotFile, source: 'snapshot' };
}
