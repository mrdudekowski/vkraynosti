import { parseCmsToursFile, type CmsToursFile } from './cmsTourDocument';
import { cmsDocumentToSiteTour } from './cmsDocumentToSiteTour';
import { assertPublicSnapshotToursProjection } from './publicSnapshotRelease';
import {
  buildCmsPublishedToursUrl,
  resolveCmsContentBaseUrl,
  resolveCmsLocalFallbackUrl,
} from './cmsContentUrls';
import { loadEmbeddedPublicSnapshot } from './loadEmbeddedPublicSnapshot';
import { fetchCmsJson } from './fetchCmsJson';

export type CmsCatalogSource = 'live' | 'bake' | 'snapshot';

export type CmsCatalogLoad = { file: CmsToursFile; source: CmsCatalogSource };

function parseRenderableCmsToursFile(input: unknown): CmsToursFile {
  const file = parseCmsToursFile(input);
  file.tours.forEach(cmsDocumentToSiteTour);
  return file;
}

export async function loadLiveCmsToursFile(): Promise<CmsToursFile | null> {
  const baseUrl = resolveCmsContentBaseUrl();
  if (baseUrl == null) return null;

  try {
    return parseRenderableCmsToursFile(
      await fetchCmsJson(buildCmsPublishedToursUrl(baseUrl)),
    );
  } catch (error) {
    console.warn('[cms] Failed to load live tours catalog', error);
    return null;
  }
}

export async function loadCmsToursFile(): Promise<CmsCatalogLoad | null> {
  const liveFile = await loadLiveCmsToursFile();
  if (liveFile != null) return { file: liveFile, source: 'live' };

  let release: Awaited<ReturnType<typeof loadEmbeddedPublicSnapshot>>;
  try {
    release = await loadEmbeddedPublicSnapshot();
  } catch (error) {
    console.warn('[cms] Failed to load embedded public snapshot', error);
    return null;
  }
  if (release == null) return null;

  const snapshotFile = parseRenderableCmsToursFile(release.payload.tours);
  for (const url of [resolveCmsLocalFallbackUrl()]) {
    try {
      const separator = url.includes('?') ? '&' : '?';
      const versionedUrl = `${url}${separator}releaseId=${encodeURIComponent(release.manifest.releaseId)}`;
      const file = parseRenderableCmsToursFile(await fetchCmsJson(versionedUrl));
      assertPublicSnapshotToursProjection(release, file);
      return { file, source: 'bake' };
    } catch (error) {
      console.warn('[cms] Failed to load baked tours from', url, error);
    }
  }

  console.warn('[cms] Using embedded release snapshot for the tour catalog');
  return { file: snapshotFile, source: 'snapshot' };
}
