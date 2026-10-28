import { parseCmsToursFile, type CmsToursFile } from './cmsTourDocument';
import { cmsPublishedCatalogCandidates } from './cmsContentUrls';

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS tours fetch failed: ${response.status} ${url}`);
  }
  return response.json() as Promise<unknown>;
}

export async function loadCmsToursFile(): Promise<CmsToursFile | null> {
  for (const url of cmsPublishedCatalogCandidates()) {
    try {
      return parseCmsToursFile(await fetchJson(url));
    } catch (error) {
      console.warn('[cms] Failed to load tours from', url, error);
    }
  }
  return null;
}
