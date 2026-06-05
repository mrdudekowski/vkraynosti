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
  const [
    pageMetaSource,
    notFoundSource,
    robotsSource,
    sitemapSource,
    seoSource,
    homeSource,
    seasonLayoutSource,
    safetySource,
  ] = await Promise.all([
    read('src/components/shared/PageMeta.tsx'),
    read('src/pages/NotFoundPage.tsx'),
    read('public/robots.txt'),
    read('public/sitemap.xml'),
    read('src/constants/seo.ts'),
    read('src/pages/Home.tsx'),
    read('src/components/seasons/SeasonPageLayout.tsx'),
    read('src/pages/SafetyPage.tsx'),
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
    assertCheck(
      seoSource.includes('getAbsoluteOgImageUrl'),
      'absolute og image helper',
      'seo.ts must define getAbsoluteOgImageUrl',
    ),
    assertCheck(
      seoSource.includes('defaultOgImage'),
      'default og image',
      'SEO_DEFAULTS must include defaultOgImage',
    ),
    assertCheck(
      pageMetaSource.includes('getAbsoluteOgImageUrl'),
      'page meta absolute og',
      'PageMeta must normalize og:image via getAbsoluteOgImageUrl',
    ),
    assertCheck(
      pageMetaSource.includes('SEO_DEFAULTS.defaultOgImage'),
      'page meta og fallback',
      'PageMeta must fall back to SEO_DEFAULTS.defaultOgImage',
    ),
    assertCheck(
      !homeSource.includes('IMAGES.hero[activeSeason]') &&
        homeSource.includes('IMAGES.seasonSection[activeSeason]'),
      'home og image source',
      'Home PageMeta must use seasonSection, not placehold hero',
    ),
    assertCheck(
      seasonLayoutSource.includes('IMAGES.seasonSection[seasonKey]'),
      'season og image source',
      'SeasonPageLayout PageMeta must use seasonSection',
    ),
    assertCheck(
      !safetySource.includes('IMAGES.hero[activeSeason]') &&
        safetySource.includes('IMAGES.seasonSection[activeSeason]'),
      'safety og image source',
      'SafetyPage PageMeta must use seasonSection, not placehold hero',
    ),
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
