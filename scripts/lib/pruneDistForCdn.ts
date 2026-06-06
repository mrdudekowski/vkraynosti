/**
 * Remove CDN-hosted public folders from dist after Vite build (web-vkr / TimeWeb).
 * Browser loads tours/team/banners (+ safety teaser) from VITE_PUBLIC_ASSET_BASE_URL;
 * App keeps fonts, JS, and `public/safety/icons/` (status SVGs).
 */
import fs from 'node:fs';
import path from 'node:path';

/** Relative paths under dist/ mirrored from public/ (S3 scope minus fonts and safety/icons). */
export const CDN_DIST_RELATIVE_DIRS = [
  'tours',
  'team',
  'banners_winter',
  'banners_spring',
  'banners_summer',
  'banners_fall',
] as const;

/** Single files under dist/ served from S3 (not whole `safety/` — icons stay in App). */
export const CDN_DIST_RELATIVE_FILES = ['safety/safety.webp'] as const;

export function shouldPruneDistForCdn(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(env.VITE_PUBLIC_ASSET_BASE_URL?.trim());
}

export function pruneDistForCdn(
  distDir: string,
  { env = process.env }: { env?: NodeJS.ProcessEnv } = {},
): { pruned: string[]; skipped: string[] } {
  const allTargets = [...CDN_DIST_RELATIVE_DIRS, ...CDN_DIST_RELATIVE_FILES];

  if (!shouldPruneDistForCdn(env)) {
    return { pruned: [], skipped: allTargets };
  }

  const pruned: string[] = [];
  const skipped: string[] = [];

  for (const relativeDir of CDN_DIST_RELATIVE_DIRS) {
    const absoluteDir = path.join(distDir, relativeDir);
    if (!fs.existsSync(absoluteDir)) {
      skipped.push(relativeDir);
      continue;
    }
    fs.rmSync(absoluteDir, { recursive: true, force: true });
    pruned.push(relativeDir);
  }

  for (const relativeFile of CDN_DIST_RELATIVE_FILES) {
    const absoluteFile = path.join(distDir, relativeFile);
    if (!fs.existsSync(absoluteFile)) {
      skipped.push(relativeFile);
      continue;
    }
    fs.unlinkSync(absoluteFile);
    pruned.push(relativeFile);
  }

  return { pruned, skipped };
}
