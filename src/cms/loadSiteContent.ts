import { parseSiteContentDocument, type SiteContentDocument, type SiteContentDocumentKind } from './siteContentDocument';
import {
  buildCmsPublishedSiteContentUrl,
  resolveCmsContentBaseUrl,
} from './cmsContentUrls';

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
  if (kind === 'team') return parseSiteContentDocument('team', input);
  if (kind === 'contacts') return parseSiteContentDocument('contacts', input);
  return parseSiteContentDocument('footer', input);
}

export async function loadPublishedSiteContent(
  kind: SiteContentDocumentKind,
): Promise<SiteContentDocument | null> {
  const baseUrl = resolveCmsContentBaseUrl();
  if (baseUrl == null) {
    return null;
  }

  const url = buildCmsPublishedSiteContentUrl(baseUrl, kind);
  try {
    const document = parseDocument(kind, await fetchJson(url));
    lastValidByKind.set(kind, document);
    return document;
  } catch (error) {
    console.warn(`[cms] Failed to load ${kind} site content`, error);
    return lastValidByKind.get(kind) ?? null;
  }
}
