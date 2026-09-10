import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import {
  collectCmsMigrationMedia,
  dedupeCmsMigrationMedia,
} from '../../src/cms/collectCmsMigrationMedia.ts';

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'tmp', 'cms-catalog');
const fullMediaMigration = process.argv.includes('--full-media');

const readDotEnv = async (filePath: string): Promise<Record<string, string>> => {
  const { readFile } = await import('node:fs/promises');
  const env: Record<string, string> = {};
  try {
    const text = await readFile(filePath, 'utf8');
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (line.length === 0 || line.startsWith('#') || !line.includes('=')) {
        continue;
      }
      const eq = line.indexOf('=');
      env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
  } catch {
    /* optional file */
  }
  return env;
};

const writeJson = async (filePath: string, value: unknown): Promise<void> => {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

console.log(`cms:export starting Vite SSR (${fullMediaMigration ? 'full media' : 'pilot media'})…`);

const server = await createServer({
  root: rootDir,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true },
});

try {
  const { TOURS } = await server.ssrLoadModule('/src/data/toursData.ts');
  const { buildCmsTourPackages, compilePublishedToursFile } = await server.ssrLoadModule(
    '/src/cms/buildCmsToursFile.ts'
  );
  const {
    CMS_DRAFT_INDEX_KEY,
    CMS_LEGACY_DRAFT_CATALOG_KEY,
    CMS_PUBLISHED_CATALOG_KEY,
    cmsDraftDocumentKey,
    cmsDraftMetaKey,
    cmsPublishedDocumentKey,
  } = await server.ssrLoadModule('/src/cms/cmsPackageKeys.ts');
  const { cmsDraftIndexFile } = await server.ssrLoadModule('/src/cms/cmsDraftIndex.ts');
  const { siteTourToCmsDocument } = await server.ssrLoadModule('/src/cms/siteTourToCmsDocument.ts');

  if (!Array.isArray(TOURS) || TOURS.length === 0) {
    throw new Error('TOURS is empty');
  }

  const cmsEnv = await readDotEnv(path.join(rootDir, '.env.cms-dev'));
  const publicBase =
    cmsEnv.S3_PUBLIC_BASE_URL?.replace(/\/+$/, '') ??
    'https://s3.twcstorage.ru/vkraynosti-cms-dev';

  const packages = buildCmsTourPackages(TOURS, {
    publicBaseUrl: publicBase,
    rewriteAllTourMedia: fullMediaMigration,
    meta: { updatedAt: new Date().toISOString() },
  });
  const catalog = compilePublishedToursFile(packages);
  const draftIndex = cmsDraftIndexFile(packages.map((item: { tourId: string }) => item.tourId));

  await mkdir(outDir, { recursive: true });
  await mkdir(path.join(rootDir, 'public', 'data', 'cms'), { recursive: true });

  const jsonObjects: { key: string; localPath: string }[] = [];

  const addJson = async (key: string, value: unknown) => {
    const localPath = path.join(outDir, key);
    await writeJson(localPath, value);
    jsonObjects.push({ key, localPath });
  };

  await addJson(CMS_PUBLISHED_CATALOG_KEY, catalog);
  await addJson(CMS_DRAFT_INDEX_KEY, draftIndex);
  await writeJson(path.join(rootDir, 'public', 'data', 'cms', 'tours.json'), catalog);

  for (const item of packages) {
    await addJson(cmsDraftDocumentKey(item.tourId), item.document);
    await addJson(cmsDraftMetaKey(item.tourId), item.meta);
    if (item.document.status === 'active') {
      await addJson(cmsPublishedDocumentKey(item.tourId), item.document);
    }
  }

  const mediaObjects = fullMediaMigration
    ? dedupeCmsMigrationMedia(
        packages.flatMap((item: { tourId: string; document: unknown }) => {
          const original = TOURS.find((tour: { id: string }) => tour.id === item.tourId);
          if (original == null) {
            return [];
          }
          return collectCmsMigrationMedia(
            siteTourToCmsDocument(original),
            item.document,
            publicBase
          );
        })
      )
    : [];

  if (!fullMediaMigration) {
    const CMS_DEV_REWRITE_TOUR_ID = 'summer-8';
    const pilotPackage = packages.find(
      (item: { tourId: string }) => item.tourId === CMS_DEV_REWRITE_TOUR_ID
    );
    const pilotOriginal = TOURS.find((tour: { id: string }) => tour.id === CMS_DEV_REWRITE_TOUR_ID);
    if (pilotPackage != null && pilotOriginal != null) {
      mediaObjects.push(
        ...collectCmsMigrationMedia(
          siteTourToCmsDocument(pilotOriginal),
          pilotPackage.document,
          publicBase
        )
      );
    }
  }

  const bentoCount = catalog.tours.filter(
    (tour: { bento: { blocks: unknown[] } }) => tour.bento.blocks.length > 0
  ).length;

  await writeJson(path.join(outDir, 'manifest.json'), {
    bucketHint: cmsEnv.S3_BUCKET ?? 'vkraynosti-cms-dev',
    fullMediaMigration,
    mediaSourceBase:
      cmsEnv.CMS_MEDIA_SOURCE_BASE ??
      cmsEnv.VITE_PUBLIC_ASSET_BASE_URL ??
      'https://4unja6slv5.cdn.twcstorage.ru/',
    jsonObjects,
    mediaObjects,
    deleteKeys: [CMS_LEGACY_DRAFT_CATALOG_KEY],
  });

  const bySeason = packages.reduce(
    (counts: Record<string, number>, item: { document: { season: string } }) => {
      counts[item.document.season] = (counts[item.document.season] ?? 0) + 1;
      return counts;
    },
    {}
  );

  console.log(
    `CMS packages: ${packages.length} tours (${JSON.stringify(bySeason)}), catalog ${catalog.tours.length} active (${bentoCount} bento), ${jsonObjects.length} json keys, ${mediaObjects.length} media objects`
  );
} finally {
  await server.close();
}
