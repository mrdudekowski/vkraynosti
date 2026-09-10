import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const CMS_DEV_REWRITE_TOUR_ID = 'summer-8';
const rootDir = process.cwd();
const outDir = path.join(rootDir, 'tmp', 'cms-catalog');

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

console.log('cms:export starting Vite SSR…');

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
    CMS_LEGACY_DRAFT_CATALOG_KEY,
    CMS_PUBLISHED_CATALOG_KEY,
    cmsDraftDocumentKey,
    cmsDraftMetaKey,
    cmsPublishedDocumentKey,
  } = await server.ssrLoadModule('/src/cms/cmsPackageKeys.ts');
  const { cmsObjectKeyFromPublicUrl: keyFromUrl, siteTourToCmsDocument } =
    await server.ssrLoadModule('/src/cms/siteTourToCmsDocument.ts');

  if (!Array.isArray(TOURS) || TOURS.length === 0) {
    throw new Error('TOURS is empty');
  }

  const cmsEnv = await readDotEnv(path.join(rootDir, '.env.cms-dev'));
  const publicBase =
    cmsEnv.S3_PUBLIC_BASE_URL?.replace(/\/+$/, '') ??
    'https://s3.twcstorage.ru/vkraynosti-cms-dev';

  const packages = buildCmsTourPackages(TOURS, {
    publicBaseUrl: publicBase,
    meta: { updatedAt: new Date().toISOString() },
  });
  const catalog = compilePublishedToursFile(packages);
  const rewritten = packages.find((item: { tourId: string }) => item.tourId === CMS_DEV_REWRITE_TOUR_ID)
    ?.document;
  const original = TOURS.find((tour: { id: string }) => tour.id === CMS_DEV_REWRITE_TOUR_ID);
  if (rewritten == null || original == null) {
    throw new Error(`Rewritten tour ${CMS_DEV_REWRITE_TOUR_ID} missing from export`);
  }

  await mkdir(outDir, { recursive: true });
  await mkdir(path.join(rootDir, 'public', 'data', 'cms'), { recursive: true });

  const jsonObjects: { key: string; localPath: string }[] = [];

  const addJson = async (key: string, value: unknown) => {
    const localPath = path.join(outDir, key);
    await writeJson(localPath, value);
    jsonObjects.push({ key, localPath });
  };

  await addJson(CMS_PUBLISHED_CATALOG_KEY, catalog);
  await writeJson(path.join(rootDir, 'public', 'data', 'cms', 'tours.json'), catalog);

  for (const item of packages) {
    await addJson(cmsDraftDocumentKey(item.tourId), item.document);
    await addJson(cmsDraftMetaKey(item.tourId), item.meta);
    if (item.document.status === 'active') {
      await addJson(cmsPublishedDocumentKey(item.tourId), item.document);
    }
  }

  const originalDoc = siteTourToCmsDocument(original);
  const originalById = new Map(
    originalDoc.assets.map((asset: { id: string }) => [asset.id, asset])
  );
  const mediaObjects = rewritten.assets.flatMap(
    (asset: { id: string; stillUrl: string; videoUrl: string | null }) => {
      const source = originalById.get(asset.id) as
        | { stillUrl: string; videoUrl: string | null }
        | undefined;
      if (source == null) {
        return [];
      }
      const rows = [{ sourceUrl: source.stillUrl, key: keyFromUrl(asset.stillUrl, publicBase) }];
      if (source.videoUrl != null && asset.videoUrl != null) {
        rows.push({
          sourceUrl: source.videoUrl,
          key: keyFromUrl(asset.videoUrl, publicBase),
        });
      }
      return rows;
    }
  );

  const bentoCount = catalog.tours.filter(
    (tour: { bento: { blocks: unknown[] } }) => tour.bento.blocks.length > 0
  ).length;

  await writeJson(path.join(outDir, 'manifest.json'), {
    bucketHint: cmsEnv.S3_BUCKET ?? 'vkraynosti-cms-dev',
    jsonObjects,
    mediaObjects,
    deleteKeys: [CMS_LEGACY_DRAFT_CATALOG_KEY],
  });

  console.log(
    `CMS packages: ${packages.length} tours, catalog ${catalog.tours.length} active (${bentoCount} bento), ${jsonObjects.length} json keys, ${mediaObjects.length} cms-dev media`
  );
} finally {
  await server.close();
}
