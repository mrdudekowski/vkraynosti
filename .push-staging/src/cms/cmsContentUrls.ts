import { readViteEnv } from '../constants/readViteEnv';
import {
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
} from './cmsPackageKeys';

export const CMS_PUBLISHED_TOURS_PATH = CMS_PUBLISHED_CATALOG_KEY;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function cmsLocalDataBasePath(): string {
  const basePath = (readViteEnv('BASE_URL') ?? '/').replace(/\/+$/, '');
  return `${basePath}/data/cms`;
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

export function resolveCmsLocalFallbackUrl(): string {
  return `${cmsLocalDataBasePath()}/tours.json`;
}

export function resolveCmsLocalToursListFallbackUrl(): string {
  return `${cmsLocalDataBasePath()}/tour-schedule/tours_list.json`;
}

export function resolveCmsLocalScheduleFallbackUrl(): string {
  return `${cmsLocalDataBasePath()}/tour-schedule/schedule.json`;
}

/** URL overlay календаря: cms-dev, затем локальный fallback. Прод-путь сюда не входит. */
export function cmsTourScheduleOverlayCandidates(): {
  toursList: string[];
  schedule: string[];
} {
  const remoteBase = resolveCmsContentBaseUrl();
  if (remoteBase == null) {
    return { toursList: [], schedule: [] };
  }
  return {
    toursList: [
      buildCmsPublishedToursListUrl(remoteBase),
      resolveCmsLocalToursListFallbackUrl(),
    ],
    schedule: [
      buildCmsPublishedScheduleUrl(remoteBase),
      resolveCmsLocalScheduleFallbackUrl(),
    ],
  };
}
