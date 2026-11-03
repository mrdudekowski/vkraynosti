import { parseSiteContentDocument, type SiteContentDocument, type SiteContentDocumentKind } from './siteContentDocument';
import { cmsPublishedSiteContentCandidates } from './cmsContentUrls';

const lastValidByKind = new Map<SiteContentDocumentKind, SiteContentDocument>();

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS site content fetch failed: ${response.status} ${url}`);
  }
  return response.json() as Promise<unknown>;
}

function parseDocument(
  kind: SiteContentDocumentKind,
  input: unknown,
): SiteContentDocument {
  return parseSiteContentDocument(kind, input);
}

export async function loadPublishedSiteContent(
  kind: SiteContentDocumentKind,
): Promise<SiteContentDocument | null> {
  for (const url of cmsPublishedSiteContentCandidates(kind)) {
    try {
      const document = parseDocument(kind, await fetchJson(url));
      lastValidByKind.set(kind, document);
      return document;
    } catch (error) {
      console.warn(`[cms] Failed to load ${kind} site content from`, url, error);
    }
  }
  return lastValidByKind.get(kind) ?? null;
}
