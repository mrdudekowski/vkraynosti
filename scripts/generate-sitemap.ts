import { setupOgShellBuildEnv } from './lib/ogShellEnv.ts';

setupOgShellBuildEnv();

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { normalizeCanonicalPath } from '../src/constants/canonicalUrl.ts';
import { getIndexableRoutePaths, resolveSiteRoot } from './lib/seoRoutes.mjs';

const rootDir = process.cwd();
const siteRoot = resolveSiteRoot();

const createUrlNode = (routePath: string): string => {
  const normalizedPath = normalizeCanonicalPath(routePath);
  const loc = `${siteRoot}${normalizedPath === '/' ? '/' : normalizedPath}`;
  return `  <url><loc>${loc}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`;
};

const run = async (): Promise<void> => {
  const allRoutes = await getIndexableRoutePaths(rootDir);
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
  process.stderr.write(
    `generate-sitemap failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
