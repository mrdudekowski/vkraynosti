import { readViteEnv } from '../constants/readViteEnv';
import type { SiteContentDocument, SiteContentDocumentKind } from './siteContentDocument';
import { parseSiteContentDocument } from './siteContentDocument';
import {
  buildSiteContentPublishedUrl,
  resolveSiteContentBaseUrl,
  resolveSiteContentLocalFallbackUrl,
} from './siteContentUrls';

const lastValidSnapshots = new Map<SiteContentDocumentKind, SiteContentDocument>();

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS site content fetch failed: ${response.status} ${url}`);
  }
  return response.json() as Promise<unknown>;
}

export async function loadPublishedSiteContent(
  kind: SiteContentDocumentKind,
): Promise<SiteContentDocument | null> {
  const remoteBase = resolveSiteContentBaseUrl();
  if (remoteBase == null) {
    return null;
  }

  const candidates = [
    buildSiteContentPublishedUrl(remoteBase, kind),
    resolveSiteContentLocalFallbackUrl(kind),
  ];
  let lastError: unknown;
  for (const url of candidates) {
    try {
      const document = parseSiteContentDocument(kind, await fetchJson(url));
      lastValidSnapshots.set(kind, document);
      return document;
    } catch (error) {
      lastError = error;
    }
  }

  if (import.meta.env.DEV) {
    console.warn(`[cms] Failed to load site content (${kind})`, lastError);
  }
  return lastValidSnapshots.get(kind) ?? null;
}

export function clearSiteContentSnapshotCache(): void {
  lastValidSnapshots.clear();
}

export function siteContentLocalDataBasePath(): string {
  const basePath = (readViteEnv('BASE_URL') ?? '/').replace(/\/+$/, '');
  return `${basePath}/data/cms/site-content`;
}
