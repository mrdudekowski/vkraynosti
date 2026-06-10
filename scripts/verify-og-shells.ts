import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { isNormalizedMetaContent } from '../src/constants/metaContent.ts';
import { normalizeCanonicalPath } from '../src/constants/canonicalUrl.ts';
import { getIndexableRoutePaths, routePathToDistFile } from './lib/seoRoutes.mjs';
import {
  OG_SHELL_IMAGE_HEIGHT,
  OG_SHELL_IMAGE_WIDTH,
  probeJpegDimensions,
} from './lib/ogShellTelegramImage.ts';

const OG_TEST_ROUTE = '/og-test';
const TELEGRAM_OG_TEST_ROUTE = '/og-test-telegram-20260610';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');

const DIMENSION_SAMPLE_ROUTES = ['/', '/tours/summer/summer-10', OG_TEST_ROUTE, TELEGRAM_OG_TEST_ROUTE];

const DEFAULT_SITE_URL = 'https://vkraynosti.ru';

const REQUIRED_SINGLE_TAGS = [
  'property="og:title"',
  'property="og:description"',
  'property="og:type"',
  'property="og:url"',
  'property="og:image"',
  'property="og:image:secure_url"',
  'property="og:image:type"',
  'property="og:image:width"',
  'property="og:image:height"',
  'property="og:image:alt"',
  'name="twitter:card"',
  'name="twitter:title"',
  'name="twitter:description"',
  'name="twitter:image"',
  'name="twitter:url"',
] as const;

const URL_TAGS = ['rel="canonical"', 'property="og:url"', 'name="twitter:url"'] as const;

const TEXT_META_ATTRS = [
  { attr: 'property="og:title"', label: 'og:title' },
  { attr: 'property="og:description"', label: 'og:description' },
  { attr: 'property="og:image:alt"', label: 'og:image:alt' },
  { attr: 'name="twitter:title"', label: 'twitter:title' },
  { attr: 'name="twitter:description"', label: 'twitter:description' },
] as const;

const resolveExpectedSiteOrigin = (): string => {
  const customSiteUrl = (process.env.VITE_SITE_URL || '').trim();
  const siteUrl = customSiteUrl || DEFAULT_SITE_URL;
  try {
    return new URL(siteUrl).origin;
  } catch {
    throw new Error(`Invalid VITE_SITE_URL: ${siteUrl}`);
  }
};

const resolveOgShellLogicalImagePath = (pathOrUrl: string): string => {
  let pathname: string;
  if (/^https?:\/\//i.test(pathOrUrl)) {
    pathname = new URL(pathOrUrl).pathname;
  } else {
    pathname = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  }
  let logical = pathname.replace(/^\/+/, '');
  if (logical.startsWith('vkraynosti/')) {
    logical = logical.slice('vkraynosti/'.length);
  }
  return logical;
};

const readHtml = async (routePath: string): Promise<string> => {
  const filePath = routePathToDistFile(routePath, distDir);
  return readFile(filePath, 'utf8');
};

const countMatches = (html: string, needle: string): number => {
  const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return (html.match(re) ?? []).length;
};

const extractMetaContent = (html: string, attrNeedle: string): string | null => {
  const re = new RegExp(
    `<meta\\s+${attrNeedle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+content="([^"]*)"`,
    'i',
  );
  return re.exec(html)?.[1] ?? null;
};

const extractCanonicalHref = (html: string): string | null => {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return match?.[1] ?? null;
};

const assertSingleTags = (html: string, routePath: string, errors: string[]): void => {
  if (!/<title>[\s\S]*?<\/title>/i.test(html)) {
    errors.push('missing title');
  }
  if (!/<meta\s+name="description"/i.test(html)) {
    errors.push('missing meta description');
  }
  if (!/<link\s+rel="canonical"/i.test(html)) {
    errors.push('missing canonical');
  }

  for (const tag of REQUIRED_SINGLE_TAGS) {
    const count = countMatches(html, tag);
    if (count === 0) {
      errors.push(`missing ${tag}`);
    } else if (count > 1) {
      errors.push(`duplicate ${tag} (${count})`);
    }
  }
};

const assertTrailingSlashUrls = (html: string, routePath: string, errors: string[]): void => {
  const expectedPath = normalizeCanonicalPath(routePath);
  for (const tag of URL_TAGS) {
    const value =
      tag === 'rel="canonical"' ? extractCanonicalHref(html) : extractMetaContent(html, tag);
    if (!value) {
      continue;
    }
    let pathname: string;
    try {
      pathname = new URL(value).pathname;
    } catch {
      errors.push(`${tag} is not a valid URL: ${value}`);
      continue;
    }
    const normalized = normalizeCanonicalPath(pathname);
    if (normalized !== expectedPath) {
      errors.push(`${tag} path mismatch: expected ${expectedPath}, got ${normalized}`);
    }
    if (normalized !== '/' && !normalized.endsWith('/')) {
      errors.push(`${tag} missing trailing slash: ${value}`);
    }
  }
};

const assertNormalizedText = (html: string, errors: string[]): void => {
  const title = extractMetaContent(html, 'property="og:title"');
  if (title != null && !isNormalizedMetaContent(title)) {
    errors.push('og:title is not normalized');
  }

  for (const { attr, label } of TEXT_META_ATTRS) {
    const value = extractMetaContent(html, attr);
    if (value == null) {
      continue;
    }
    if (!isNormalizedMetaContent(value)) {
      errors.push(`${label} is not normalized`);
    }
    if (/\s{2,}/.test(value)) {
      errors.push(`${label} contains repeated spaces`);
    }
  }
};

const assertOgImage = (
  html: string,
  routePath: string,
  expectedOrigin: string,
  errors: string[],
  checkDimensions: boolean,
): void => {
  const ogImage = extractMetaContent(html, 'property="og:image"');
  const secureUrl = extractMetaContent(html, 'property="og:image:secure_url"');
  if (!ogImage) {
    return;
  }

  if (!/^https:\/\//i.test(ogImage)) {
    errors.push(`og:image is not absolute https: ${ogImage}`);
  }
  if (secureUrl && secureUrl !== ogImage) {
    errors.push('og:image:secure_url must match og:image');
  }
  if (!ogImage.endsWith('.jpg')) {
    errors.push(`og:image must be JPEG path: ${ogImage}`);
  }

  let ogOrigin: string;
  try {
    ogOrigin = new URL(ogImage).origin;
  } catch {
    errors.push(`og:image is not a valid URL: ${ogImage}`);
    return;
  }

  if (ogOrigin !== expectedOrigin) {
    errors.push(`og:image origin must be App (${expectedOrigin}), got ${ogOrigin}`);
  }

  const logicalPath = resolveOgShellLogicalImagePath(ogImage);
  const assetPath = resolve(distDir, logicalPath);
  if (!existsSync(assetPath)) {
    errors.push(`og:image file missing in dist: ${logicalPath}`);
    return;
  }

  const width = extractMetaContent(html, 'property="og:image:width"');
  const height = extractMetaContent(html, 'property="og:image:height"');
  if (width !== String(OG_SHELL_IMAGE_WIDTH)) {
    errors.push(`og:image:width must be ${OG_SHELL_IMAGE_WIDTH}, got ${width ?? 'missing'}`);
  }
  if (height !== String(OG_SHELL_IMAGE_HEIGHT)) {
    errors.push(`og:image:height must be ${OG_SHELL_IMAGE_HEIGHT}, got ${height ?? 'missing'}`);
  }

  if (!checkDimensions) {
    return;
  }
};

const assertRoute = async (
  routePath: string,
  expectedOrigin: string,
  checkDimensions: boolean,
): Promise<void> => {
  const html = await readHtml(routePath);
  const errors: string[] = [];

  assertSingleTags(html, routePath, errors);
  assertTrailingSlashUrls(html, routePath, errors);
  assertNormalizedText(html, errors);
  assertOgImage(html, routePath, expectedOrigin, errors, false);

  if (checkDimensions) {
    const ogImage = extractMetaContent(html, 'property="og:image"');
    if (ogImage) {
      const logicalPath = resolveOgShellLogicalImagePath(ogImage);
      const assetPath = resolve(distDir, logicalPath);
      const dimensions = await probeJpegDimensions(assetPath);
      if (!dimensions) {
        errors.push(`could not probe JPEG dimensions: ${logicalPath}`);
      } else if (
        dimensions.width !== OG_SHELL_IMAGE_WIDTH ||
        dimensions.height !== OG_SHELL_IMAGE_HEIGHT
      ) {
        errors.push(
          `JPEG dimensions ${dimensions.width}x${dimensions.height}, expected ${OG_SHELL_IMAGE_WIDTH}x${OG_SHELL_IMAGE_HEIGHT} (${logicalPath})`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`${routePath}: ${errors.join(', ')}`);
  }
};

const run = async (): Promise<void> => {
  const expectedOrigin = resolveExpectedSiteOrigin();
  const routes = [...(await getIndexableRoutePaths(rootDir)), OG_TEST_ROUTE, TELEGRAM_OG_TEST_ROUTE];

  for (const routePath of routes) {
    const checkDimensions = DIMENSION_SAMPLE_ROUTES.includes(routePath);
    await assertRoute(routePath, expectedOrigin, checkDimensions);
    process.stdout.write(`[PASS] og-shell meta ${routePath}\n`);
  }

  process.stdout.write(`OG shell verification passed (${routes.length} routes).\n`);
};

run().catch((error) => {
  process.stderr.write(
    `verify-og-shells failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
