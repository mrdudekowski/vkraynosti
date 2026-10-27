import { parseCmsToursFile, type CmsToursFile } from './cmsTourDocument';
import { resolveCmsLocalFallbackUrl } from './cmsContentUrls';

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS tours fetch failed: ${response.status} ${url}`);
  }
  return response.json() as Promise<unknown>;
}

export async function loadCmsToursFile(): Promise<CmsToursFile | null> {
  try {
    return parseCmsToursFile(await fetchJson(resolveCmsLocalFallbackUrl()));
  } catch (error) {
    console.warn('[cms] Failed to load bake tours', error);
    return null;
  }
}
