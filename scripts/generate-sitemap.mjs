import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const SITE_URL = 'https://mrdudekowski.github.io/vkraynosti';

const read = async (filePath) => readFile(resolve(rootDir, filePath), 'utf8');

const extractStaticRoutes = (routesSource) => {
  const matches = [...routesSource.matchAll(/^\s+([A-Z_]+):\s+'([^']+)'/gm)];
  return matches
    .map(([, key, path]) => ({ key, path }))
    .filter(route => !route.path.includes(':'));
};

const extractTourUrls = (toursSource) => {
  const matches = [...toursSource.matchAll(/id:\s*'([^']+)'.*?season:\s*'(winter|spring|summer|fall)'/gs)];
  return matches.map(([, id, season]) => `/tours/${season}/${id}`);
};

const createUrlNode = (path) => `  <url><loc>${SITE_URL}${path}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`;

const run = async () => {
  const [routesSource, toursSource] = await Promise.all([
    read('src/constants/routes.ts'),
    read('src/data/toursData.ts'),
  ]);

  const staticRoutes = extractStaticRoutes(routesSource).map(route => route.path);
  const tourRoutes = extractTourUrls(toursSource);

  const allRoutes = [...new Set([...(staticRoutes.includes('/') ? [] : ['/']), ...staticRoutes, ...tourRoutes])];
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allRoutes.map(createUrlNode),
    '</urlset>',
    '',
  ];

  await writeFile(resolve(rootDir, 'public/sitemap.xml'), xmlLines.join('\n'), 'utf8');
  process.stdout.write(`Sitemap generated: public/sitemap.xml (${allRoutes.length} URLs)\n`);
};

run().catch((error) => {
  process.stderr.write(`generate-sitemap failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
