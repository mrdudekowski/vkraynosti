import type { SiteContentDocumentKind } from './siteContentDocument';

export const SITE_CONTENT_KINDS = ['team', 'contacts', 'footer'] as const satisfies readonly SiteContentDocumentKind[];

export function siteContentDraftKey(kind: SiteContentDocumentKind): string {
  return `draft/site-content/${kind}/document.json`;
}

export function siteContentDraftMetaKey(kind: SiteContentDocumentKind): string {
  return `draft/site-content/${kind}/meta.json`;
}

export function siteContentPublishedKey(kind: SiteContentDocumentKind): string {
  return `published/site-content/${kind}/document.json`;
}

export function siteContentMediaPrefix(kind: SiteContentDocumentKind): string {
  return `media/site-content/${kind}`;
}
