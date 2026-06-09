import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { routePathToDistFile } from './lib/seoRoutes.mjs';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');

const SAMPLE_ROUTES = ['/', '/tours/summer/summer-10', '/privacy'];

const DEFAULT_SITE_URL = 'https://mrdudekowski.github.io/vkraynosti';

const resolveExpectedSiteOrigin = () => {
  const customSiteUrl = (process.env.VITE_SITE_URL || '').trim();
  const siteUrl = customSiteUrl || DEFAULT_SITE_URL;
  try {
    return new URL(siteUrl).origin;
  } catch {
    throw new Error(`Invalid VITE_SITE_URL: ${siteUrl}`);
  }
};

const resolveOgShellLogicalImagePath = (pathOrUrl) => {
  let pathname;
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

const readHtml = async (routePath) => {
  const filePath = routePathToDistFile(routePath, distDir);
  return readFile(filePath, 'utf8');
};

const assertMeta = (html, routePath, expectedOrigin) => {
  const errors = [];
  if (!/<meta\s+property="og:title"/i.test(html)) {
    errors.push('missing og:title');
  }
  if (!/<meta\s+property="og:description"/i.test(html)) {
    errors.push('missing og:description');
  }
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (!ogImageMatch) {
    errors.push('missing og:image');
  } else {
    const ogImageUrl = ogImageMatch[1];
    if (!/^https:\/\//i.test(ogImageUrl)) {
      errors.push(`og:image is not absolute: ${ogImageUrl}`);
    } else {
      let ogOrigin;
      try {
        ogOrigin = new URL(ogImageUrl).origin;
      } catch {
        errors.push(`og:image is not a valid URL: ${ogImageUrl}`);
      }
      if (ogOrigin && ogOrigin !== expectedOrigin) {
        errors.push(`og:image origin must be App (${expectedOrigin}), got ${ogOrigin}`);
      }
      if (ogOrigin === expectedOrigin) {
        const logicalPath = resolveOgShellLogicalImagePath(ogImageUrl);
        const assetPath = resolve(distDir, logicalPath);
        if (!existsSync(assetPath)) {
          errors.push(`og:image file missing in dist: ${logicalPath}`);
        }
      }
    }
  }
  if (!/<link\s+rel="canonical"/i.test(html)) {
    errors.push('missing canonical');
  }
  if (errors.length > 0) {
    throw new Error(`${routePath}: ${errors.join(', ')}`);
  }
};

const run = async () => {
  const expectedOrigin = resolveExpectedSiteOrigin();
  for (const routePath of SAMPLE_ROUTES) {
    const html = await readHtml(routePath);
    assertMeta(html, routePath, expectedOrigin);
    process.stdout.write(`[PASS] og-shell meta ${routePath}\n`);
  }
  process.stdout.write('OG shell verification passed.\n');
};

run().catch((error) => {
  process.stderr.write(
    `verify-og-shells failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
