import { readViteEnv } from '../constants/readViteEnv';
import {
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
} from './cmsPackageKeys';
import { siteContentPublishedKey } from './siteContentPackageKeys';
import type { SiteContentDocumentKind } from './siteContentDocument';

export const CMS_PUBLISHED_TOURS_PATH = CMS_PUBLISHED_CATALOG_KEY;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function publicDataBasePath(): string {
  const basePath = (readViteEnv('BASE_URL') ?? '/').replace(/\/+$/, '');
  return `${basePath}/data`;
}

function cmsLocalDataBasePath(): string {
  return `${publicDataBasePath()}/cms`;
}

export function resolveCmsContentBaseUrl(): string | null {
  const explicit = readViteEnv('VITE_CMS_S3_BASE_URL');
  if (explicit == null) {
    return null;
  }
  return stripTrailingSlash(explicit);
}

export function buildCmsPublishedToursUrl(baseUrl: string): string {
  return `${stripTrailingSlash(baseUrl)}/${CMS_PUBLISHED_CATALOG_KEY}`;
}

export function buildCmsPublishedToursListUrl(baseUrl: string): string {
  return `${stripTrailingSlash(baseUrl)}/${CMS_PUBLISHED_TOURS_LIST_KEY}`;
}

export function buildCmsPublishedScheduleUrl(baseUrl: string): string {
  return `${stripTrailingSlash(baseUrl)}/${CMS_PUBLISHED_SCHEDULE_KEY}`;
}

export function buildCmsPublishedSiteContentUrl(
  baseUrl: string,
  kind: SiteContentDocumentKind,
): string {
  return `${stripTrailingSlash(baseUrl)}/${siteContentPublishedKey(kind)}`;
}

export function resolveCmsLocalFallbackUrl(): string {
  return `${cmsLocalDataBasePath()}/tours.json`;
}

export function resolveCmsLocalToursListFallbackUrl(): string {
  return `${cmsLocalDataBasePath()}/tour-schedule/tours_list.json`;
}

export function resolveCmsLocalScheduleFallbackUrl(): string {
  return `${cmsLocalDataBasePath()}/tour-schedule/schedule.json`;
}

export function resolveCmsLocalSiteContentUrl(kind: SiteContentDocumentKind): string {
  if (kind === 'seo') {
    return `${cmsLocalDataBasePath()}/site-seo/document.json`;
  }
  return `${cmsLocalDataBasePath()}/site-content/${kind}/document.json`;
}

/** Runtime documents come from published CMS first; same-origin files are the outage fallback. */
export function cmsPublishedSiteContentCandidates(kind: SiteContentDocumentKind): string[] {
  const snapshot = resolveCmsLocalSiteContentUrl(kind);
  if (kind === 'seo') return [snapshot];
  const live = resolveCmsContentBaseUrl();
  return live == null
    ? [snapshot]
    : [buildCmsPublishedSiteContentUrl(live, kind), snapshot];
}

export function cmsTourScheduleBakeCandidates(): {
  toursList: string[];
  schedule: string[];
} {
  const data = publicDataBasePath();
  return {
    toursList: [
      resolveCmsLocalToursListFallbackUrl(),
      `${data}/tour-schedule/tours_list.json`,
    ],
    schedule: [
      resolveCmsLocalScheduleFallbackUrl(),
      `${data}/tour-schedule/schedule.json`,
    ],
  };
}

export function cmsPublishedCatalogCandidates(): string[] {
  const snapshot = resolveCmsLocalFallbackUrl();
  const live = resolveCmsContentBaseUrl();
  return live == null ? [snapshot] : [buildCmsPublishedToursUrl(live), snapshot];
}

/** Live published JSON first when CMS env is set, then same-origin bake. */
export function cmsTourScheduleOverlayCandidates(): {
  toursList: string[];
  schedule: string[];
} {
  const bake = cmsTourScheduleBakeCandidates();
  const live = resolveCmsContentBaseUrl();
  if (live == null) return bake;
  return {
    toursList: [buildCmsPublishedToursListUrl(live), ...bake.toursList],
    schedule: [buildCmsPublishedScheduleUrl(live), ...bake.schedule],
  };
}
