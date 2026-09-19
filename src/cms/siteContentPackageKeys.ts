import type { SiteContentDocumentKind } from './siteContentDocument';

export const SITE_CONTENT_KINDS = ['team', 'contacts', 'footer', 'modal'] as const satisfies readonly SiteContentDocumentKind[];

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
  return `media/site-content/${kind}/`;
}

const SITE_CONTENT_MEDIA_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
};

export function siteContentMediaExtensionForMime(mime: string): string | null {
  return SITE_CONTENT_MEDIA_EXTENSIONS[mime] ?? null;
}

export function siteContentMediaObjectKey(
  kind: SiteContentDocumentKind,
  assetId: string,
  extension: string,
): string {
  return `${siteContentMediaPrefix(kind)}${assetId}.${extension}`;
}

export function siteContentMediaDeleteKeys(
  kind: SiteContentDocumentKind,
  assetId: string,
): string[] {
  return [
    `media/site-content/${kind}${assetId}`,
    `${siteContentMediaPrefix(kind)}${assetId}`,
    ...Object.values(SITE_CONTENT_MEDIA_EXTENSIONS).map((extension) =>
      siteContentMediaObjectKey(kind, assetId, extension),
    ),
  ];
}
