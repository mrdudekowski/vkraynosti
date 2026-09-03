#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  getRenderableRoutePaths,
  getSitemapRoutePaths,
  NON_INDEXABLE_ROUTE_PATHS,
  resolveSiteRoot,
  routePathToDistFile,
} from './lib/seoRoutes.mjs';

const normalizePath = (value) => {
  if (!value || value === '/') return '/';
  const path = value.startsWith('/') ? value : `/${value}`;
  return path.endsWith('/') ? path : `${path}/`;
};

const routeFromLoc = (loc, siteRoot) => {
  try {
    const url = new URL(loc);
    if (url.origin !== new URL(siteRoot).origin) return null;
    return normalizePath(url.pathname);
  } catch {
    return null;
  }
};

const extract = (html, pattern) => html.match(pattern)?.[1]?.trim() ?? null;

const validateHtml = (html, routePath) => {
  const errors = [];
  const title = extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = extract(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)/i);
  const robots = extract(html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)/i)?.toLowerCase();
  const canonical = extract(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i);

  if (!title) errors.push(`${routePath}: missing title`);
  if (!description) errors.push(`${routePath}: missing meta description`);
  if (!robots) errors.push(`${routePath}: missing meta robots`);
  if (!canonical) errors.push(`${routePath}: missing canonical`);
  if (!/<h1[\s>]/i.test(html)) errors.push(`${routePath}: missing H1`);
  if (!/<script\s+type=["']application\/ld\+json["']/i.test(html)) {
    errors.push(`${routePath}: missing JSON-LD`);
  }
  if (robots?.includes('index') && !robots.includes('noindex') && !canonical) {
    errors.push(`${routePath}: indexable route has no canonical`);
  }

  if (canonical) {
    try {
      if (normalizePath(new URL(canonical).pathname) !== normalizePath(routePath)) {
        errors.push(`${routePath}: canonical path mismatch (${canonical})`);
      }
    } catch {
      errors.push(`${routePath}: canonical is not an absolute URL (${canonical})`);
    }
  }

  return errors;
};

export async function collectSeoDistErrors({
  rootDir = process.cwd(),
  distDir = resolve(rootDir, 'dist'),
  sitemapXml,
  readFile: readFileImpl = (filePath) => readFile(filePath, 'utf8'),
  fileExists = existsSync,
  expectedRoutes,
  renderableRoutes,
} = {}) {
  const siteRoot = resolveSiteRoot();
  const xml = sitemapXml ?? (await readFileImpl(resolve(rootDir, 'public/sitemap.xml')));
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(([, loc]) => loc.trim());
  const sitemapRoutes = [...new Set(locs.map((loc) => routeFromLoc(loc, siteRoot)).filter(Boolean))];
  const expected = expectedRoutes ?? (await getSitemapRoutePaths(rootDir));
  const renderable = renderableRoutes ?? (await getRenderableRoutePaths(rootDir));
  const errors = [];

  for (const routePath of expected) {
    const normalized = normalizePath(routePath);
    if (!sitemapRoutes.includes(normalized)) errors.push(`missing sitemap route: ${normalized}`);
    const filePath = routePathToDistFile(normalized, distDir);
    if (!fileExists(filePath)) errors.push(`missing rendered HTML for sitemap route: ${normalized}`);
  }
  for (const routePath of sitemapRoutes) {
    if (!expected.map(normalizePath).includes(routePath)) {
      errors.push(`unexpected sitemap route: ${routePath}`);
    }
    if (NON_INDEXABLE_ROUTE_PATHS.has(routePath.replace(/\/$/, ''))) {
      errors.push(`non-indexable route is present in sitemap: ${routePath}`);
    }
  }

  for (const routePath of renderable) {
    const normalized = normalizePath(routePath);
    const filePath = routePathToDistFile(normalized, distDir);
    if (!fileExists(filePath)) {
      errors.push(`missing rendered HTML: ${normalized}`);
      continue;
    }
    errors.push(...validateHtml(await readFileImpl(filePath), normalized));
  }

  return errors;
}

const run = async () => {
  const errors = await collectSeoDistErrors();
  if (errors.length) {
    process.stderr.write(`SEO dist verification failed (${errors.length} issue(s))\n`);
    errors.forEach((error) => process.stderr.write(`- ${error}\n`));
    process.exitCode = 1;
    return;
  }
  process.stdout.write('SEO dist verification passed.\n');
};

if (process.argv[1]?.endsWith('verify-seo-dist.mjs')) {
  run().catch((error) => {
    process.stderr.write(`verify-seo-dist failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
