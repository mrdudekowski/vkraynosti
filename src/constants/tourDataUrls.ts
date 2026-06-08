/** Пути JSON в S3 (или local public/data). SSOT для ключей объектов. */
export const TOUR_DATA_S3_PATHS = {
  toursList: 'tour-schedule/tours_list.json',
  schedule: 'tour-schedule/schedule.json',
} as const;

/**
 * Базовый публичный URL S3/CDN для runtime JSON.
 * Prod: VITE_PUBLIC_S3_BASE_URL или VITE_PUBLIC_ASSET_BASE_URL (тот же бакет).
 * Dev/E2E: fallback на static files в public/data.
 */
export const resolvePublicS3BaseUrl = (): string => {
  const explicit = import.meta.env.VITE_PUBLIC_S3_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const assetBase = import.meta.env.VITE_PUBLIC_ASSET_BASE_URL?.trim();
  if (assetBase) return assetBase.replace(/\/$/, '');

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${basePath}/data`;
  }

  return `${basePath}/data`;
};

export const buildTourDataFileUrl = (relativePath: string): string => {
  const base = resolvePublicS3BaseUrl();
  const normalizedPath = relativePath.replace(/^\//, '');
  return `${base}/${normalizedPath}`;
};
