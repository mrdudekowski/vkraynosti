import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { routePathToDistFile } from './lib/seoRoutes.mjs';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');

const SAMPLE_ROUTES = ['/', '/tours/summer/summer-1', '/privacy'];

const readHtml = async (routePath) => {
  const filePath = routePathToDistFile(routePath, distDir);
  return readFile(filePath, 'utf8');
};

const assertMeta = (html, routePath) => {
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
  } else if (!/^https:\/\//i.test(ogImageMatch[1])) {
    errors.push(`og:image is not absolute: ${ogImageMatch[1]}`);
  }
  if (!/<link\s+rel="canonical"/i.test(html)) {
    errors.push('missing canonical');
  }
  if (errors.length > 0) {
    throw new Error(`${routePath}: ${errors.join(', ')}`);
  }
};

const run = async () => {
  for (const routePath of SAMPLE_ROUTES) {
    const html = await readHtml(routePath);
    assertMeta(html, routePath);
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
