import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripLegacyDeployPrefix } from '../../src/constants/publicAssetBase.ts';
import { loadCmsApiEnv, readDotEnvFile } from './api/env.ts';
import { createS3JsonStore } from './api/store.ts';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifestPath = path.join(rootDir, 'tmp', 'cms-catalog', 'manifest.json');
const DEFAULT_MEDIA_SOURCE_BASE = 'https://4unja6slv5.cdn.twcstorage.ru/';

type ManifestMedia = { sourceUrl: string; key: string };
type ManifestJson = { key: string; localPath: string };
type Manifest = {
  fullMediaMigration?: boolean;
  mediaSourceBase?: string;
  jsonObjects: ManifestJson[];
  mediaObjects?: ManifestMedia[];
  deleteKeys?: string[];
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readSourceBytes(
  sourceUrl: string,
  mediaBase: string
): Promise<Uint8Array | null> {
  const candidates: string[] = [];

  if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
    candidates.push(sourceUrl);
    const pathname = stripLegacyDeployPrefix(new URL(sourceUrl).pathname);
    const localFromSite = path.join(rootDir, 'public', pathname.replace(/^\//, ''));
    if (await fileExists(localFromSite)) {
      return new Uint8Array(await readFile(localFromSite));
    }
  } else {
    const logicalPath = stripLegacyDeployPrefix(sourceUrl);
    const localPath = path.join(rootDir, 'public', logicalPath.replace(/^\//, ''));
    if (await fileExists(localPath)) {
      return new Uint8Array(await readFile(localPath));
    }
    const normalized = logicalPath.startsWith('/') ? logicalPath : `/${logicalPath}`;
    candidates.push(`${mediaBase.replace(/\/+$/, '')}${normalized}`);
  }

  for (const url of candidates) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
          return new Uint8Array(await response.arrayBuffer());
        }
      } catch (error) {
        if (attempt === 3) {
          console.warn(`fetch failed (${url}): ${error instanceof Error ? error.message : String(error)}`);
        } else {
          await new Promise((resolve) => setTimeout(resolve, attempt * 500));
        }
      }
    }
  }

  return null;
}

function contentTypeFor(key: string): string {
  if (key.endsWith('.webp')) return 'image/webp';
  if (key.endsWith('.webm')) return 'video/webm';
  if (key.endsWith('.mp4')) return 'video/mp4';
  if (key.endsWith('.json')) return 'application/json';
  return 'application/octet-stream';
}

async function resolveMediaSourceBase(
  manifest: Manifest,
  cmsEnv: Record<string, string>,
  localEnv: Record<string, string>
): Promise<string> {
  return (
    manifest.mediaSourceBase ??
    cmsEnv.CMS_MEDIA_SOURCE_BASE ??
    localEnv.VITE_PUBLIC_ASSET_BASE_URL ??
    process.env.VITE_PUBLIC_ASSET_BASE_URL ??
    localEnv.VITE_PUBLIC_S3_BASE_URL ??
    process.env.VITE_PUBLIC_S3_BASE_URL ??
    DEFAULT_MEDIA_SOURCE_BASE
  ).replace(/\/+$/, '');
}

async function main(): Promise<void> {
  const env = await loadCmsApiEnv(rootDir);
  if (env.storeKind !== 's3') {
    throw new Error('cms:upload-catalog requires CMS_STORE=s3 and S3 credentials in .env.cms-dev');
  }

  const mediaOnly = process.argv.includes('--media-only');
  const cmsEnv = await readDotEnvFile(path.join(rootDir, '.env.cms-dev'));
  const localEnv = await readDotEnvFile(path.join(rootDir, '.env.local'));
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Manifest;
  const mediaBase = await resolveMediaSourceBase(manifest, cmsEnv, localEnv);
  const store = createS3JsonStore(env.s3);

  console.info(`media source base: ${mediaBase}`);

  if (!mediaOnly) {
    for (const item of manifest.jsonObjects) {
      const value = JSON.parse(await readFile(item.localPath, 'utf8')) as unknown;
      await store.putJson(item.key, value);
      console.info(`uploaded ${item.key}`);
    }
  }

  let uploadedMedia = 0;
  let skippedMedia = 0;
  for (const item of manifest.mediaObjects ?? []) {
    try {
      const body = await readSourceBytes(item.sourceUrl, mediaBase);
      if (body == null) {
        skippedMedia += 1;
        console.warn(`media skip (source missing): ${item.sourceUrl}`);
        continue;
      }
      await store.putBytes(item.key, body, contentTypeFor(item.key));
      uploadedMedia += 1;
      if (uploadedMedia % 25 === 0) {
        console.info(`uploaded ${uploadedMedia} media files…`);
      }
    } catch (error) {
      skippedMedia += 1;
      console.warn(
        `media skip (upload error) ${item.key}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  for (const key of manifest.deleteKeys ?? []) {
    await store.deleteBytes(key);
    console.info(`deleted ${key}`);
  }

  console.info(
    `CMS catalog uploaded to ${env.s3.bucket}: media ${uploadedMedia} ok, ${skippedMedia} skipped`
  );

  if (manifest.fullMediaMigration && skippedMedia > 0) {
    process.exitCode = 1;
  }
}

await main();
