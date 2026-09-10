import { readViteEnv } from '../constants/readViteEnv';
import { siteContentPublishedKey } from './siteContentPackageKeys';
import type { SiteContentDocumentKind } from './siteContentDocument';

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function resolveSiteContentBaseUrl(): string | null {
  const explicit = readViteEnv('VITE_CMS_S3_BASE_URL');
  return explicit == null || explicit.trim().length === 0 ? null : stripTrailingSlash(explicit.trim());
}

export function buildSiteContentPublishedUrl(baseUrl: string, kind: SiteContentDocumentKind): string {
  return `${stripTrailingSlash(baseUrl)}/${siteContentPublishedKey(kind)}`;
}

export function resolveSiteContentLocalFallbackUrl(kind: SiteContentDocumentKind): string {
  const basePath = (readViteEnv('BASE_URL') ?? '/').replace(/\/+$/, '');
  return `${basePath}/data/cms/site-content/${kind}.json`;
}
