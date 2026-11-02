import type { SiteContentDocumentKind } from './siteContentDocument';

export { SITE_CONTENT_KINDS } from './siteContentDocument';

export function siteContentDraftKey(kind: SiteContentDocumentKind): string {
  if (kind === 'seo') return 'draft/site-seo/document.json';
  return `draft/site-content/${kind}/document.json`;
}

export function siteContentDraftMetaKey(kind: SiteContentDocumentKind): string {
  if (kind === 'seo') return 'draft/site-seo/meta.json';
  return `draft/site-content/${kind}/meta.json`;
}

export function siteContentPublishedKey(kind: SiteContentDocumentKind): string {
  if (kind === 'seo') return 'published/site-seo/document.json';
  return `published/site-content/${kind}/document.json`;
}

export function siteContentMediaPrefix(kind: SiteContentDocumentKind): string {
  return `media/site-content/${kind}`;
}
