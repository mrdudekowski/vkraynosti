import { setupOgShellBuildEnv } from './lib/ogShellEnv.ts';

setupOgShellBuildEnv();

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { normalizeCanonicalPath } from '../src/constants/canonicalUrl.ts';
import { getSitemapRoutePaths, resolveSiteRoot } from './lib/seoRoutes.mjs';

const rootDir = process.cwd();
const siteRoot = resolveSiteRoot();

// No <lastmod>: a build-date stamp on every URL is fake freshness and trains crawlers to
// ignore the signal. Omitting it is honest. ponytail: add real per-URL lastmod only when the
// catalog exposes a per-tour modification timestamp (currently it doesn't).
const createUrlNode = (routePath: string): string => {
  const normalizedPath = normalizeCanonicalPath(routePath);
  const loc = `${siteRoot}${normalizedPath === '/' ? '/' : normalizedPath}`;
  return `  <url><loc>${loc}</loc></url>`;
};

const run = async (): Promise<void> => {
  const allRoutes = await getSitemapRoutePaths(rootDir);
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
