/**
 * Remove CDN-hosted public folders from dist after Vite build (web-vkr / TimeWeb).
 * Browser loads tours/team/banners/safety from VITE_PUBLIC_ASSET_BASE_URL; App keeps fonts + JS.
 */
import fs from 'node:fs';
import path from 'node:path';

/** Relative paths under dist/ mirrored from public/ (S3 scope minus fonts). */
export const CDN_DIST_RELATIVE_DIRS = [
  'tours',
  'team',
  'banners_winter',
  'banners_spring',
  'banners_summer',
  'banners_fall',
  'safety',
] as const;

export function shouldPruneDistForCdn(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(env.VITE_PUBLIC_ASSET_BASE_URL?.trim());
}

export function pruneDistForCdn(
  distDir: string,
  { env = process.env }: { env?: NodeJS.ProcessEnv } = {},
): { pruned: string[]; skipped: string[] } {
  if (!shouldPruneDistForCdn(env)) {
    return { pruned: [], skipped: [...CDN_DIST_RELATIVE_DIRS] };
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

  return { pruned, skipped };
}
