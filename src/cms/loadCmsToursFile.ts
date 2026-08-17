import { parseCmsToursFile, type CmsToursFile } from './cmsTourDocument';
import {
  buildCmsPublishedToursUrl,
  resolveCmsContentBaseUrl,
  resolveCmsLocalFallbackUrl,
} from './cmsContentUrls';

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS tours fetch failed: ${response.status} ${url}`);
  }
  return response.json() as Promise<unknown>;
}

export async function loadCmsToursFile(): Promise<CmsToursFile | null> {
  const remoteBase = resolveCmsContentBaseUrl();
  if (remoteBase == null) {
    return null;
  }

  const candidates = [
    buildCmsPublishedToursUrl(remoteBase),
    resolveCmsLocalFallbackUrl(),
  ];

  let lastError: unknown;
  for (const url of candidates) {
    try {
      return parseCmsToursFile(await fetchJson(url));
    } catch (error) {
      lastError = error;
    }
  }

  console.warn('[cms] Failed to load tours overlay', lastError);
  return null;
}
