import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const read = (filePath) => readFile(resolve(rootDir, filePath), 'utf8');

const countMatches = (input, pattern) => (input.match(pattern) ?? []).length;

const extractTourUrls = (toursDataSource) => {
  const entries = [...toursDataSource.matchAll(/id:\s*'([^']+)'.*?season:\s*'(winter|spring|summer|fall)'/gs)];
  return entries.map(([, id, season]) => `/tours/${season}/${id}`);
};

const extractStaticRoutes = (routesSource) => {
  const routeMatches = [...routesSource.matchAll(/^\s+([A-Z_]+):\s+'([^']+)'/gm)];
  return routeMatches
    .map(([, key, path]) => ({ key, path }))
    .filter(route => !route.path.includes(':'));
};

const toChecklistLine = (label, ok, details) =>
  `- [${ok ? 'x' : ' '}] ${label}: ${details}`;

const run = async () => {
  const [
    pageMetaSource,
    routesSource,
    routerSource,
    toursDataSource,
    robotsSource,
    sitemapSource,
    seoSource,
    homeSource,
    notFoundSource,
  ] = await Promise.all([
    read('src/components/shared/PageMeta.tsx'),
    read('src/constants/routes.ts'),
    read('src/router.tsx'),
    read('src/data/toursData.ts'),
    read('public/robots.txt').catch(() => ''),
    read('public/sitemap.xml').catch(() => ''),
    read('src/constants/seo.ts').catch(() => ''),
    read('src/pages/Home.tsx'),
    read('src/pages/NotFoundPage.tsx'),
  ]);

  const staticRoutes = extractStaticRoutes(routesSource).map(route => route.path);
  const tourUrls = extractTourUrls(toursDataSource);
  const allIndexableUrls = [...new Set([...staticRoutes.filter(path => path !== '/'), '/', ...tourUrls])];

  const hasCanonical = pageMetaSource.includes('rel="canonical"');
  const hasMetaRobots = pageMetaSource.includes('name="robots"');
  const hasOpenGraphUrl = pageMetaSource.includes('property="og:url"');
  const hasTwitterCard = pageMetaSource.includes('name="twitter:card"');
  const hasStructuredData = pageMetaSource.includes('application/ld+json');
  const hasNoindexFor404 =
    notFoundSource.includes('robots={SEO_DEFAULTS.notFound.robots}') ||
    notFoundSource.includes("robots='noindex,nofollow'");
  const hasOrganizationSchemaOnHome = homeSource.includes('ORGANIZATION_SCHEMA');

  const hasRobotsFile = robotsSource.trim().length > 0;
  const hasSitemapFile = sitemapSource.trim().length > 0;
  const sitemapUrlCount = countMatches(sitemapSource, /<url>/g);
  const pageMetaUsageCount = countMatches(routerSource + homeSource + notFoundSource, /PageMeta/g);
  const seoSingleSourceEnabled = seoSource.includes('SEO_DEFAULTS');

  const report = `# SEO Baseline Audit (Phase 1)

Generated: ${new Date().toISOString()}

## Route Inventory

- Static indexable routes: ${staticRoutes.join(', ')}
- Tour detail routes: ${tourUrls.length}
- Total planned indexable URLs: ${allIndexableUrls.length}

## Metadata Foundation Checks

${toChecklistLine('Canonical tag in shared meta layer', hasCanonical, hasCanonical ? 'Found in PageMeta' : 'Missing in PageMeta')}
${toChecklistLine('Meta robots in shared meta layer', hasMetaRobots, hasMetaRobots ? 'Found in PageMeta' : 'Missing in PageMeta')}
${toChecklistLine('Open Graph URL', hasOpenGraphUrl, hasOpenGraphUrl ? 'Found in PageMeta' : 'Missing in PageMeta')}
${toChecklistLine('Twitter card', hasTwitterCard, hasTwitterCard ? 'Found in PageMeta' : 'Missing in PageMeta')}
${toChecklistLine('JSON-LD structured data support', hasStructuredData, hasStructuredData ? 'Supported in PageMeta' : 'Not supported in PageMeta')}
${toChecklistLine('404 is noindex', hasNoindexFor404, hasNoindexFor404 ? 'NotFound page sets noindex' : 'No noindex on NotFound')}

## Crawlability & Indexability Checks

${toChecklistLine('robots.txt exists', hasRobotsFile, hasRobotsFile ? 'public/robots.txt found' : 'public/robots.txt missing')}
${toChecklistLine('sitemap.xml exists', hasSitemapFile, hasSitemapFile ? `public/sitemap.xml found (${sitemapUrlCount} URLs)` : 'public/sitemap.xml missing')}
${toChecklistLine('Single SEO source of truth', seoSingleSourceEnabled, seoSingleSourceEnabled ? 'src/constants/seo.ts detected' : 'SEO constants file not found')}

## SPA SEO Risk Snapshot

- Router mode: createBrowserRouter (client-side SPA)
- Deployment baseline: GitHub Pages with 404 redirect fallback
- Risk status: Requires periodic deep-link validation on deployed environment

## Coverage Notes

- PageMeta references sampled in key files: ${pageMetaUsageCount}
- Home structured data schema wired: ${hasOrganizationSchemaOnHome ? 'yes' : 'no'}
- Missing data for full production-grade audit: live crawl logs, Search Console coverage, CWV field data (CrUX/RUM)
`;

  await writeFile(resolve(rootDir, 'docs/SEO_BASELINE_PHASE1.md'), report, 'utf8');
  process.stdout.write('SEO baseline report updated: docs/SEO_BASELINE_PHASE1.md\n');
};

run().catch((error) => {
  process.stderr.write(`seo-baseline-audit failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
