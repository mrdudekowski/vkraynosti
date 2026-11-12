import { parseSiteContentDocument, type SiteContentDocument, type SiteContentDocumentKind } from './siteContentDocument';
import {
  buildCmsPublishedSiteContentUrl,
  cmsPublishedSiteContentCandidates,
  resolveCmsContentBaseUrl,
  resolveCmsLocalSiteContentUrl,
} from './cmsContentUrls';
import { loadEmbeddedPublicSnapshot } from './loadEmbeddedPublicSnapshot';
import { serializeCanonicalJson } from './publicSnapshotRelease';
import { fetchCmsJson } from './fetchCmsJson';

const lastValidByKind = new Map<SiteContentDocumentKind, SiteContentDocument>();

async function fetchJson(url: string): Promise<unknown> {
  return fetchCmsJson(url);
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
  if (kind !== 'seo') {
    const baseUrl = resolveCmsContentBaseUrl();
    if (baseUrl != null) {
      const liveUrl = buildCmsPublishedSiteContentUrl(baseUrl, kind);
      try {
        const document = parseDocument(kind, await fetchJson(liveUrl));
        lastValidByKind.set(kind, document);
        return document;
      } catch (error) {
        console.warn(`[cms] Failed to load live ${kind} site content`, error);
      }
    }

    const lastValid = lastValidByKind.get(kind);
    if (lastValid != null) return lastValid;

    try {
      const release = await loadEmbeddedPublicSnapshot();
      const snapshotDocument = release?.payload.siteContent[kind];
      const document = snapshotDocument == null
        ? parseDocument(kind, await fetchJson(resolveCmsLocalSiteContentUrl(kind)))
        : parseDocument(kind, snapshotDocument);
      lastValidByKind.set(kind, document);
      return document;
    } catch (error) {
      console.warn(`[cms] Failed to load ${kind} site content snapshot`, error);
      return null;
    }
  }

  for (const url of cmsPublishedSiteContentCandidates(kind)) {
    try {
      const release = await loadEmbeddedPublicSnapshot();
      const document = parseDocument(kind, await fetchJson(url));
      if (kind === 'seo' && release != null) {
        const expected = release.payload.siteContent[kind];
        if (serializeCanonicalJson(document) !== serializeCanonicalJson(expected)) {
          throw new Error('Baked SEO document does not match embedded release');
        }
      }
      lastValidByKind.set(kind, document);
      return document;
    } catch (error) {
      console.warn(`[cms] Failed to load ${kind} site content from`, url, error);
    }
  }
  return lastValidByKind.get(kind) ?? null;
}
