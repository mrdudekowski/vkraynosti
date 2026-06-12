#!/usr/bin/env node
/**
 * Post-deploy SEO smoke test: sitemap URLs must be indexable; 404 must stay closed.
 *
 * Usage:
 *   node scripts/check-seo-indexing.mjs
 *   node scripts/check-seo-indexing.mjs --base https://vkraynosti.ru
 */

const DEFAULT_BASE_URL = 'https://vkraynosti.ru';
const NOT_FOUND_PROBE_PATH = '/non-existent-page-test/';
const FETCH_TIMEOUT_MS = 30_000;
const MAX_BODY_CHARS = 512_000;

const parseArgs = () => {
  const args = process.argv.slice(2);
  let baseUrl = (process.env.SEO_CHECK_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--base' && args[index + 1]) {
      baseUrl = args[index + 1].replace(/\/+$/, '');
      index += 1;
    }
  }

  return { baseUrl };
};

const normalizePath = (path) => {
  if (!path || path === '/') return '/';
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
};

const extractMetaRobots = (html) => {
  const match = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)
    ?? html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']robots["']/i);
  return match?.[1]?.trim().toLowerCase() ?? null;
};

const extractCanonical = (html) => {
  const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)
    ?? html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
  return match?.[1]?.trim() ?? null;
};

const hasNoindex = (robotsValue) => robotsValue != null && robotsValue.includes('noindex');

const parseSitemapUrls = (xml, baseUrl) => {
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(([, loc]) => loc.trim());
  return [...new Set(locs.filter((loc) => loc.startsWith(baseUrl)))];
};

const resultLine = (status, url, detail) => `[${status}] ${url}${detail ? ` — ${detail}` : ''}`;

const checkPublicUrl = async (url) => {
  const response = await fetchWithTimeout(url, { method: 'GET' });
  const html = (await response.text()).slice(0, MAX_BODY_CHARS);
  const robots = extractMetaRobots(html);
  const canonical = extractCanonical(html);
  const xRobots = response.headers.get('x-robots-tag');

  if (response.status !== 200) {
    return { ok: false, detail: `HTTP ${response.status}` };
  }
  if (hasNoindex(robots)) {
    return { ok: false, detail: `meta robots="${robots}"` };
  }
  if (xRobots != null && xRobots.toLowerCase().includes('noindex')) {
    return { ok: false, detail: `X-Robots-Tag: ${xRobots}` };
  }
  if (canonical == null) {
    return { ok: false, detail: 'missing canonical' };
  }

  const expectedPath = normalizePath(new URL(url).pathname);
  const canonicalPath = normalizePath(new URL(canonical).pathname);
  if (canonicalPath !== expectedPath) {
    return { ok: false, detail: `canonical mismatch: ${canonical}` };
  }

  return { ok: true, detail: `robots=${robots ?? '(absent)'}, canonical OK` };
};

const checkNotFoundUrl = async (url) => {
  const response = await fetchWithTimeout(url, { method: 'GET' });
  const html = (await response.text()).slice(0, MAX_BODY_CHARS);
  const robots = extractMetaRobots(html);
  const xRobots = response.headers.get('x-robots-tag');

  if (response.status !== 404 && response.status !== 200) {
    return { ok: false, detail: `unexpected HTTP ${response.status}` };
  }
  if (!hasNoindex(robots) && !(xRobots != null && xRobots.toLowerCase().includes('noindex'))) {
    return {
      ok: false,
      detail: `expected noindex, got robots="${robots ?? '(absent)'}" and X-Robots-Tag=${xRobots ?? '(absent)'}`,
    };
  }

  return { ok: true, detail: `HTTP ${response.status}, closed from indexing` };
};

const run = async () => {
  const { baseUrl } = parseArgs();
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const results = [];

  process.stdout.write(`SEO indexing check for ${baseUrl}\n`);

  const sitemapResponse = await fetchWithTimeout(sitemapUrl);
  if (!sitemapResponse.ok) {
    results.push({ status: 'FAIL', url: sitemapUrl, detail: `HTTP ${sitemapResponse.status}` });
  } else {
    const sitemapXml = await sitemapResponse.text();
    const urls = parseSitemapUrls(sitemapXml, baseUrl);
    results.push({
      status: 'PASS',
      url: sitemapUrl,
      detail: `${urls.length} URL(s)`,
    });

    for (const url of urls) {
      try {
        const check = await checkPublicUrl(url);
        results.push({
          status: check.ok ? 'PASS' : 'FAIL',
          url,
          detail: check.detail,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({ status: 'FAIL', url, detail: message });
      }
    }
  }

  const notFoundUrl = `${baseUrl}${NOT_FOUND_PROBE_PATH}`;
  try {
    const check = await checkNotFoundUrl(notFoundUrl);
    results.push({
      status: check.ok ? 'PASS' : 'FAIL',
      url: notFoundUrl,
      detail: check.detail,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ status: 'FAIL', url: notFoundUrl, detail: message });
  }

  const priorityUrls = [
    `${baseUrl}/`,
    `${baseUrl}/tours/summer/`,
    `${baseUrl}/tours/summer/ostrov-petrova/`,
    `${baseUrl}/tours/spring/ostrov-askold/`,
  ];

  for (const url of priorityUrls) {
    if (results.some((entry) => entry.url === url)) continue;
    try {
      const check = await checkPublicUrl(url);
      results.push({
        status: check.ok ? 'PASS' : 'FAIL',
        url,
        detail: check.detail,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ status: 'FAIL', url, detail: message });
    }
  }

  results.forEach((entry) => {
    process.stdout.write(`${resultLine(entry.status, entry.url, entry.detail)}\n`);
  });

  const failed = results.filter((entry) => entry.status === 'FAIL');
  if (failed.length > 0) {
    process.stderr.write(`\nSEO indexing check failed: ${failed.length} issue(s)\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('\nSEO indexing check passed.\n');
};

run().catch((error) => {
  process.stderr.write(
    `check-seo-indexing failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
