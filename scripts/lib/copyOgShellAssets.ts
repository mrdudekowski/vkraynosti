import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DEFAULT_OG_SHELL_BANNER_LOGICAL } from '../../src/constants/images.ts';
import { resolveOgShellLogicalImagePath } from '../../src/constants/seo.ts';
import { ensureTelegramFriendlyOgImage } from './ogShellTelegramImage.ts';

export const OG_SHELL_ASSET_MANIFEST = '.og-shell-assets.json' as const;

export interface OgShellAssetManifest {
  allowedRelativePaths: string[];
}

export const collectOgShellImageLogicalPaths = (imagePathOrUrls: Iterable<string>): string[] => {
  const unique = new Set<string>([DEFAULT_OG_SHELL_BANNER_LOGICAL]);
  for (const pathOrUrl of imagePathOrUrls) {
    unique.add(resolveOgShellLogicalImagePath(pathOrUrl));
  }
  return [...unique].sort();
};

function buildCdnAssetUrl(logical: string): string | null {
  const cdn = process.env.VITE_PUBLIC_ASSET_BASE_URL?.trim();
  if (!cdn) {
    return null;
  }
  const base = cdn.endsWith('/') ? cdn : `${cdn}/`;
  return `${base}${logical}`;
}

async function fetchCdnAsset(url: string, targetPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(targetPath, buffer);
}

async function copyLocalAsset(sourcePath: string, targetPath: string, logical: string): Promise<void> {
  await copyFile(sourcePath, targetPath);
  process.stdout.write(`[og-asset] copied ${logical}\n`);
}

async function fetchRemoteAsset(url: string, targetPath: string, logical: string): Promise<void> {
  await fetchCdnAsset(url, targetPath);
  process.stdout.write(`[og-asset] fetched ${logical} from CDN\n`);
}

async function materializeOgShellAsset(
  distDir: string,
  rootDir: string,
  logical: string,
): Promise<string> {
  const targetPath = resolve(distDir, logical);
  await mkdir(dirname(targetPath), { recursive: true });
  const localPath = resolve(rootDir, 'public', logical);

  if (existsSync(localPath)) {
    await copyLocalAsset(localPath, targetPath, logical);
    return ensureTelegramFriendlyOgImage(distDir, logical);
  }

  const cdnUrl = buildCdnAssetUrl(logical);
  if (cdnUrl) {
    try {
      await fetchRemoteAsset(cdnUrl, targetPath, logical);
      return ensureTelegramFriendlyOgImage(distDir, logical);
    } catch (error) {
      if (logical === DEFAULT_OG_SHELL_BANNER_LOGICAL) {
        throw new Error(
          `OG shell fallback banner unavailable (${DEFAULT_OG_SHELL_BANNER_LOGICAL}): ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      process.stdout.write(
        `[og-asset] warn: ${logical} unavailable (${error instanceof Error ? error.message : String(error)}), using fallback banner\n`,
      );
      return materializeOgShellAsset(distDir, rootDir, DEFAULT_OG_SHELL_BANNER_LOGICAL);
    }
  }

  throw new Error(
    `OG shell asset missing in public/ and VITE_PUBLIC_ASSET_BASE_URL is unset: ${logical}`,
  );
}

export async function copyOgShellAssets(
  distDir: string,
  rootDir: string,
  logicalPaths: readonly string[],
): Promise<Map<string, string>> {
  const resolvedPathByRequested = new Map<string, string>();

  for (const logical of logicalPaths) {
    if (resolvedPathByRequested.has(logical)) {
      continue;
    }
    const resolved = await materializeOgShellAsset(distDir, rootDir, logical);
    resolvedPathByRequested.set(logical, resolved);
  }

  return resolvedPathByRequested;
}

export async function writeOgShellAssetManifest(
  distDir: string,
  materializedPaths: Iterable<string>,
): Promise<void> {
  const allowedRelativePaths = [...new Set(materializedPaths)].sort();
  const manifest: OgShellAssetManifest = { allowedRelativePaths };
  await writeFile(
    resolve(distDir, OG_SHELL_ASSET_MANIFEST),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
}

export const resolveOgShellImageForMeta = (
  imagePathOrUrl: string,
  resolvedPathByRequested: Map<string, string>,
): string => {
  const logical = resolveOgShellLogicalImagePath(imagePathOrUrl);
  return resolvedPathByRequested.get(logical) ?? logical;
};
