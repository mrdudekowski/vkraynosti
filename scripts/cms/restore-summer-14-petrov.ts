import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectCmsMigrationMedia,
  dedupeCmsMigrationMedia,
} from '../../src/cms/collectCmsMigrationMedia.ts';
import {
  CMS_PUBLISHED_CATALOG_KEY,
  cmsDraftDocumentKey,
  cmsDraftMetaKey,
  cmsPublishedDocumentKey,
} from '../../src/cms/cmsPackageKeys.ts';
import { parseCmsToursFile } from '../../src/cms/cmsTourDocument.ts';
import { stripLegacyDeployPrefix } from '../../src/constants/publicAssetBase.ts';
import { loadCmsApiEnv, readDotEnvFile } from './api/env.ts';
import { createS3JsonStore } from './api/store.ts';

const TOUR_ID = 'summer-14';
const DEFAULT_MEDIA_SOURCE_BASE =
  'https://s3.twcstorage.ru/1beb22d2-76b9-47e6-bbf0-5c9cc8d51ea7';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function contentTypeFor(key: string): string {
  if (key.endsWith('.webp')) return 'image/webp';
  if (key.endsWith('.webm')) return 'video/webm';
  if (key.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}

async function fetchBytes(url: string): Promise<Uint8Array | null> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        return new Uint8Array(await response.arrayBuffer());
      }
    } catch (error) {
      if (attempt === 3) {
        console.warn(
          `fetch failed (${url}): ${error instanceof Error ? error.message : String(error)}`
        );
      } else {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }
  return null;
}

async function main(): Promise<void> {
  const env = await loadCmsApiEnv(rootDir);
  if (env.storeKind !== 's3') {
    throw new Error('restore-summer-14-petrov requires CMS_STORE=s3 in .env.cms-dev');
  }

  const cmsEnv = await readDotEnvFile(path.join(rootDir, '.env.cms-dev'));
  const publicBase =
    cmsEnv.S3_PUBLIC_BASE_URL?.replace(/\/+$/, '') ??
    'https://s3.twcstorage.ru/vkraynosti-cms-dev';
  const mediaSourceBase = (
    cmsEnv.CMS_MEDIA_SOURCE_BASE ?? DEFAULT_MEDIA_SOURCE_BASE
  ).replace(/\/+$/, '');

  console.info(`public base: ${publicBase}`);
  console.info(`media source: ${mediaSourceBase}`);

  const server = await createServer({
    root: rootDir,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true },
  });

  try {
    const { TOURS } = await server.ssrLoadModule('/src/data/toursData.ts');
    const { buildCmsTourPackages } = await server.ssrLoadModule('/src/cms/buildCmsToursFile.ts');
    const { siteTourToCmsDocument } = await server.ssrLoadModule('/src/cms/siteTourToCmsDocument.ts');

    const tour = TOURS.find((item: { id: string }) => item.id === TOUR_ID);
    if (tour == null) {
      throw new Error(`Tour ${TOUR_ID} not found in toursData`);
    }

    const [packageItem] = buildCmsTourPackages([tour], {
      publicBaseUrl: publicBase,
      rewriteAllTourMedia: true,
      meta: { updatedAt: new Date().toISOString() },
    });

    const original = siteTourToCmsDocument(tour);
    const mediaObjects = dedupeCmsMigrationMedia(
      collectCmsMigrationMedia(original, packageItem.document, publicBase)
    );

    const store = createS3JsonStore(env.s3);

    await store.putJson(cmsDraftDocumentKey(TOUR_ID), packageItem.document);
    await store.putJson(cmsDraftMetaKey(TOUR_ID), packageItem.meta);
    await store.putJson(cmsPublishedDocumentKey(TOUR_ID), packageItem.document);
    console.info(`uploaded JSON for ${TOUR_ID}: ${packageItem.document.title}`);

    const catalogRaw = await store.getJson(CMS_PUBLISHED_CATALOG_KEY);
    const catalog = parseCmsToursFile(catalogRaw);
    const nextTours = catalog.tours.filter((item) => item.id !== TOUR_ID);
    nextTours.push(packageItem.document);
    nextTours.sort((a, b) => a.id.localeCompare(b.id, 'en'));
    await store.putJson(CMS_PUBLISHED_CATALOG_KEY, {
      ...catalog,
      tours: nextTours,
    });
    console.info(`patched ${CMS_PUBLISHED_CATALOG_KEY}`);

    let uploadedMedia = 0;
    let skippedMedia = 0;
    for (const item of mediaObjects) {
      const logicalPath = stripLegacyDeployPrefix(
        item.sourceUrl.startsWith('http')
          ? new URL(item.sourceUrl).pathname
          : item.sourceUrl
      );
      const sourcePath = item.sourceUrl.startsWith('http')
        ? item.sourceUrl
        : `${mediaSourceBase}${logicalPath.startsWith('/') ? '' : '/'}${logicalPath}`;
      const fallbackPath = item.sourceUrl.startsWith('http')
        ? `${mediaSourceBase}${logicalPath}`
        : sourcePath;
      const body =
        (await fetchBytes(sourcePath)) ?? (sourcePath !== fallbackPath ? await fetchBytes(fallbackPath) : null);
      if (body == null) {
        skippedMedia += 1;
        console.warn(`media skip: ${sourcePath} → ${item.key}`);
        continue;
      }
      await store.putBytes(item.key, body, contentTypeFor(item.key));
      uploadedMedia += 1;
      console.info(`media ok: ${item.key}`);
    }

    console.info(
      `Restore ${TOUR_ID} complete: ${uploadedMedia} media uploaded, ${skippedMedia} skipped, bento blocks ${packageItem.document.bento.blocks.length}`
    );

    if (skippedMedia > 0) {
      process.exitCode = 1;
    }
  } finally {
    await server.close();
  }
}

await main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
