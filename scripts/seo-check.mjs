import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const read = (filePath) => readFile(resolve(rootDir, filePath), 'utf8');

const assertCheck = (condition, label, details) => ({
  ok: Boolean(condition),
  label,
  details,
});

const run = async () => {
  const [pageMetaSource, notFoundSource, robotsSource, sitemapSource, seoSource] = await Promise.all([
    read('src/components/shared/PageMeta.tsx'),
    read('src/pages/NotFoundPage.tsx'),
    read('public/robots.txt'),
    read('public/sitemap.xml'),
    read('src/constants/seo.ts'),
  ]);

  const checks = [
    assertCheck(pageMetaSource.includes('rel="canonical"'), 'canonical tag', 'PageMeta must define canonical'),
    assertCheck(pageMetaSource.includes('name="robots"'), 'robots meta', 'PageMeta must define robots meta'),
    assertCheck(pageMetaSource.includes('property="og:url"'), 'og:url', 'PageMeta must define og:url'),
    assertCheck(pageMetaSource.includes('name="twitter:card"'), 'twitter:card', 'PageMeta must define twitter card'),
    assertCheck(pageMetaSource.includes('application/ld+json'), 'structured data support', 'PageMeta must support JSON-LD'),
    assertCheck(notFoundSource.includes('robots={SEO_DEFAULTS.notFound.robots}'), '404 noindex', 'NotFound must set noindex'),
    assertCheck(robotsSource.includes('Sitemap:'), 'robots sitemap link', 'robots.txt must include sitemap'),
    assertCheck((sitemapSource.match(/<url>/g) ?? []).length > 0, 'sitemap urls', 'sitemap must include at least one URL'),
    assertCheck(seoSource.includes('SEO_DEFAULTS'), 'single source', 'seo constants must exist'),
  ];

  const failedChecks = checks.filter(check => !check.ok);
  checks.forEach(check => {
    process.stdout.write(`[${check.ok ? 'PASS' : 'FAIL'}] ${check.label} - ${check.details}\n`);
  });

  if (failedChecks.length > 0) {
    process.stderr.write(`SEO check failed: ${failedChecks.length} issue(s)\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('SEO check passed.\n');
};

run().catch((error) => {
  process.stderr.write(`seo-check failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
