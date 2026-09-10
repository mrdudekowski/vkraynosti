import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import {
  auditSeoRouteIntegrity,
  extractTourPublicUrlsFromSlugMap,
  getRenderableRoutePaths,
  getTourLegacyRedirectPaths,
  getTourStatusByPublicPath,
  loadSeoRouteSources,
  routePathToDistFile,
} from './lib/seoRoutes.mjs';

const PUBLIC_ROUTE_PATTERN = /^(?:\/$|\/safety\/?$|\/privacy\/?$|\/tours\/[^/]+(?:\/[^/]+)?\/?$)/;
const INTERNAL_HREF_PATTERN = /\bhref\s*=\s*["']([^"']+)["']/gi;
const CADDY_REDIRECT_PATTERN = /^redir\s+(\/\S+)\s+(\/\S+)\s+301\s*$/gm;

const normalizePath = (value) => {
  try {
    const url = new URL(value, 'https://vkraynosti.ru');
    if (url.origin !== 'https://vkraynosti.ru' || !PUBLIC_ROUTE_PATTERN.test(url.pathname)) {
      return null;
    }
    if (url.pathname === '/') return '/';
    return `/${url.pathname.replace(/^\/+|\/+$/g, '')}/`;
  } catch {
    return null;
  }
};

export function parseSitemapPaths(sitemapXml, siteRoot = 'https://vkraynosti.ru') {
  const paths = [];
  for (const [, loc] of sitemapXml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
    const path = normalizePath(new URL(loc, siteRoot).toString());
    if (path != null) paths.push(path);
  }
  return [...new Set(paths)];
}

export function extractSeoInternalLinks(html, from) {
  const links = [];
  for (const [, href] of html.matchAll(INTERNAL_HREF_PATTERN)) {
    const to = normalizePath(href);
    if (to != null) links.push({ from, to });
  }
  return links;
}

export function parseCaddy301Paths(caddyText) {
  return [...caddyText.matchAll(CADDY_REDIRECT_PATTERN)].map(([, from]) => `${from.replace(/\/+$/, '')}/`);
}

export async function buildSeoRouteIntegrityInput({
  rootDir = process.cwd(),
  siteRoot = 'https://vkraynosti.ru',
  sitemapXml,
  statusByPath,
  renderablePaths,
  legacyRedirectPaths,
  legacyGeneratedPaths = legacyRedirectPaths,
  legacyHttpRedirectPaths = legacyRedirectPaths,
  generatedHtmlByPath,
  tourPublicPaths,
}) {
  const allTourPaths = tourPublicPaths ?? extractTourPublicUrlsFromSlugMap((await loadSeoRouteSources(rootDir)).tourSlugsSource);
  const normalizedTourPaths = allTourPaths.map((path) => `${path.replace(/\/+$/, '')}/`);
  const statusEntries = [...statusByPath.entries()];
  const knownCatalogPaths = new Set(statusEntries.map(([path]) => `${path.replace(/\/+$/, '')}/`));
  const activePaths = statusEntries
    .filter(([, status]) => status === 'active')
    .map(([path]) => `${path.replace(/\/+$/, '')}/`);
  const inDevelopmentPaths = statusEntries
    .filter(([, status]) => status === 'in_development')
    .map(([path]) => `${path.replace(/\/+$/, '')}/`);
  const hiddenPaths = normalizedTourPaths.filter((path) => !knownCatalogPaths.has(path));
  const internalLinks = Object.entries(generatedHtmlByPath ?? {})
    .flatMap(([from, html]) => extractSeoInternalLinks(html, from));

  return {
    activePaths,
    hiddenPaths,
    inDevelopmentPaths,
    sitemapPaths: parseSitemapPaths(sitemapXml, siteRoot),
    renderablePaths: renderablePaths.map((path) => (path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`)),
    legacyRedirectPaths: legacyRedirectPaths.map((path) => `${path.replace(/\/+$/, '')}/`),
    legacyGeneratedPaths: legacyGeneratedPaths.map((path) => `${path.replace(/\/+$/, '')}/`),
    legacyHttpRedirectPaths: legacyHttpRedirectPaths.map((path) => `${path.replace(/\/+$/, '')}/`),
    internalLinks,
  };
}

const readHtmlIfPresent = async (filePath) => {
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    return null;
  }
};

export async function verifySeoRouteIntegrity({ rootDir = process.cwd(), distDir = resolve(rootDir, 'dist') } = {}) {
  const sitemapPath = resolve(distDir, 'sitemap.xml');
  const legacyRedirectRulesPath = resolve(distDir, 'legacy-redirects.caddy');
  const sitemapXml = await readFile(sitemapPath, 'utf8');
  const legacyRedirectRules = await readHtmlIfPresent(legacyRedirectRulesPath);
  const statusByPath = await getTourStatusByPublicPath(rootDir);
  const expectedRenderablePaths = await getRenderableRoutePaths(rootDir);
  const legacyRedirectPaths = await getTourLegacyRedirectPaths(rootDir);
  const generatedHtmlByPath = {};
  const actualRenderablePaths = [];
  for (const path of expectedRenderablePaths) {
    const html = await readHtmlIfPresent(routePathToDistFile(path, distDir));
    if (html != null) {
      actualRenderablePaths.push(path);
      generatedHtmlByPath[path] = html;
    }
  }
  const actualLegacyPaths = [];
  for (const path of legacyRedirectPaths) {
    if (await readHtmlIfPresent(routePathToDistFile(path, distDir)) != null) {
      actualLegacyPaths.push(path);
    }
  }
  const input = await buildSeoRouteIntegrityInput({
    rootDir,
    siteRoot: new URL(sitemapXml.match(/<loc>\s*([^<]+)/i)?.[1] ?? 'https://vkraynosti.ru/').origin,
    sitemapXml,
    statusByPath,
    renderablePaths: actualRenderablePaths,
    legacyRedirectPaths,
    legacyGeneratedPaths: actualLegacyPaths,
    legacyHttpRedirectPaths: legacyRedirectRules == null ? [] : parseCaddy301Paths(legacyRedirectRules),
    generatedHtmlByPath,
  });
  return { ...input, ...auditSeoRouteIntegrity(input) };
}

const run = async () => {
  const args = process.argv.slice(2);
  const distIndex = args.indexOf('--dist');
  const distDir = distIndex >= 0 ? resolve(args[distIndex + 1]) : resolve(process.cwd(), 'dist');
  const result = await verifySeoRouteIntegrity({ distDir });
  if (result.violations.length > 0) {
    for (const violation of result.violations) {
      process.stderr.write(`[FAIL] ${violation.code}${violation.path ? ` ${violation.path}` : ''} — ${violation.detail}\n`);
    }
    process.stderr.write(`SEO route integrity failed: ${result.violations.length} issue(s)\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `SEO route integrity passed (${result.sitemapPaths.length} Sitemap, ${result.renderablePaths.length} generated, ${result.legacyRedirectPaths.length} legacy routes).\n`,
  );
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  run().catch((error) => {
    process.stderr.write(`verify-seo-route-integrity failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
