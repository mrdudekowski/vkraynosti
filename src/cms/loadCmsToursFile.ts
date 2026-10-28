import { parseCmsToursFile, type CmsToursFile } from './cmsTourDocument';
import {
  buildCmsPublishedToursUrl,
  cmsPublishedCatalogCandidates,
  resolveCmsContentBaseUrl,
} from './cmsContentUrls';

export type CmsCatalogSource = 'live' | 'bake';

export type CmsCatalogLoad = { file: CmsToursFile; source: CmsCatalogSource };

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS tours fetch failed: ${response.status} ${url}`);
  }
  return response.json() as Promise<unknown>;
}

function catalogSourceForUrl(url: string): CmsCatalogSource {
  const liveBase = resolveCmsContentBaseUrl();
  if (liveBase != null && url.startsWith(liveBase)) {
    return 'live';
  }
  return 'bake';
}

export async function loadCmsToursFile(): Promise<CmsCatalogLoad | null> {
  for (const url of cmsPublishedCatalogCandidates()) {
    try {
      const file = parseCmsToursFile(await fetchJson(url));
      return { file, source: catalogSourceForUrl(url) };
    } catch (error) {
      console.warn('[cms] Failed to load tours from', url, error);
    }
  }
  return null;
}

export async function loadLiveCmsToursFile(): Promise<CmsToursFile | null> {
  const liveBase = resolveCmsContentBaseUrl();
  if (liveBase == null) {
    return null;
  }
  const url = buildCmsPublishedToursUrl(liveBase);
  try {
    return parseCmsToursFile(await fetchJson(url));
  } catch (error) {
    console.warn('[cms] Failed to load live tours from', url, error);
    return null;
  }
}
