/** Legacy GitHub Pages deploy prefix — strip when resolving logical media paths. */
const LEGACY_DEPLOY_PREFIX = '/vkraynosti/';

export function normalizeAssetBase(base: string): string {
  return base.endsWith('/') ? base : `${base}/`;
}

function resolveAppAssetBase(): string {
  const viteBase = import.meta.env.BASE_URL ?? '/';
  return normalizeAssetBase(viteBase);
}

function resolveMediaAssetBase(appBase: string): string {
  const external = import.meta.env.VITE_PUBLIC_ASSET_BASE_URL?.trim();
  if (external) {
    return normalizeAssetBase(external);
  }
  return appBase;
}

/** App-hosted assets: fonts, root SVG/webp in `public/` (not S3/CDN). */
export const APP_ASSET_BASE = resolveAppAssetBase();

/** Tour/team/banner/safety media — CDN when `VITE_PUBLIC_ASSET_BASE_URL` is set. */
export const MEDIA_ASSET_BASE = resolveMediaAssetBase(APP_ASSET_BASE);

export function stripLegacyDeployPrefix(path: string): string {
  if (path.startsWith(LEGACY_DEPLOY_PREFIX)) {
    return `/${path.slice(LEGACY_DEPLOY_PREFIX.length)}`;
  }
  return path;
}

/** Join media base with a logical path (`/tours/...`, legacy `/vkraynosti/tours/...`). */
export function joinMediaAssetBase(mediaBase: string, path: string): string {
  const logical = stripLegacyDeployPrefix(path);
  const withLeadingSlash = logical.startsWith('/') ? logical : `/${logical}`;
  return `${mediaBase}${withLeadingSlash.slice(1)}`;
}

/** Resolve tour/team/banner/safety URL for runtime or build-time constants. */
export function resolveMediaAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return joinMediaAssetBase(MEDIA_ASSET_BASE, path);
}
