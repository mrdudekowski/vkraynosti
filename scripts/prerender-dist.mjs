import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import {
  getRenderableRoutePaths,
  resolveSiteRoot,
  routePathToDistFile,
} from './lib/seoRoutes.mjs';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');
const previewPort = Number(process.env.PRERENDER_PREVIEW_PORT || 4173);
const previewHost = process.env.PRERENDER_PREVIEW_HOST || '127.0.0.1';

function normalizeBasePath() {
  const raw = (process.env.VITE_BASE_PATH || '/vkraynosti/').trim();
  if (!raw || raw === '/') return '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

function buildPreviewBaseUrl() {
  const basePath = normalizeBasePath();
  const origin = `http://${previewHost}:${previewPort}`;
  return basePath === '/' ? `${origin}/` : `${origin}${basePath}`;
}

function routeToAbsoluteUrl(routePath, previewBaseUrl) {
  const base = previewBaseUrl.endsWith('/') ? previewBaseUrl : `${previewBaseUrl}/`;
  if (routePath === '/') return base;
  const suffix = routePath.startsWith('/') ? routePath.slice(1) : routePath;
  return `${base}${suffix}`;
}

async function waitForPreviewReady(url, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
  }
  throw new Error(`Preview server not ready at ${url}`);
}

const PREVIEW_STOP_GRACE_MS = 3_000;

/** SIGTERM → wait → SIGKILL so CI does not hang on open stdio pipes. */
async function stopPreviewServer(child) {
  if (!child || child.killed) return;

  child.stdout?.destroy();
  child.stderr?.destroy();

  await new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const forceTimer = setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
      finish();
    }, PREVIEW_STOP_GRACE_MS);

    child.once('exit', () => {
      clearTimeout(forceTimer);
      finish();
    });

    child.kill('SIGTERM');
  });
}

function startPreviewServer() {
  const viteBin = resolve(rootDir, 'node_modules/vite/bin/vite.js');

  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      process.execPath,
      [viteBin, 'preview', '--host', previewHost, '--port', String(previewPort), '--strictPort'],
      {
        cwd: rootDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
      },
    );

    child.on('error', reject);
    child.stderr?.on('data', (chunk) => {
      process.stderr.write(chunk);
    });
    child.stdout?.on('data', (chunk) => {
      process.stdout.write(chunk);
    });

    resolvePromise({ child });
  });
}

function sanitizePrerenderedHtml(html) {
  const previewOrigin = `http://${previewHost}:${previewPort}`;
  return html.split(previewOrigin).join('');
}

async function writePrerenderedHtml(routePath, html) {
  const filePath = routePathToDistFile(routePath, distDir);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, sanitizePrerenderedHtml(html), 'utf8');
}

async function patch404Shell() {
  const filePath = resolve(distDir, '404.html');
  let html;
  try {
    html = await readFile(filePath, 'utf8');
  } catch {
    return;
  }

  const siteRoot = resolveSiteRoot();
  const basePath = normalizeBasePath();
  const faviconLightHref =
    basePath === '/' ? '/flavicon-light.png' : `${basePath}flavicon-light.png`;
  const faviconDarkHref =
    basePath === '/' ? '/flavicon-dark.png' : `${basePath}flavicon-dark.png`;
  const appleTouchIconHref =
    basePath === '/' ? '/apple-touch-icon.png' : `${basePath}apple-touch-icon.png`;
  const ogImage = `${siteRoot}/banners_summer/Summer.webp`;
  const ogTitle = 'Вкрайности — Поездки по Приморью из Владивостока';
  const ogDescription =
    'Авторские поездки по Приморью: заповедное побережье, сопки и море. Зима, весна, лето и осень — четыре сезона маршрутов из Владивостока с опытными гидами.';

  const headInjection = `
    <meta name="color-scheme" content="light only" />
    <link rel="icon" type="image/png" href="${faviconLightHref}" media="(prefers-color-scheme: light)" />
    <link rel="icon" type="image/png" href="${faviconDarkHref}" media="(prefers-color-scheme: dark)" />
    <link rel="icon" type="image/png" href="${faviconLightHref}" />
    <link rel="apple-touch-icon" href="${appleTouchIconHref}" />
    <meta name="description" content="${ogDescription}" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${ogImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDescription}" />
    <meta name="twitter:image" content="${ogImage}" />
`;

  if (html.includes('property="og:title"')) {
    await writeFile(filePath, html, 'utf8');
    return;
  }

  const patched = html.replace('</head>', `${headInjection}\n  </head>`);
  await writeFile(filePath, patched, 'utf8');
  process.stdout.write('Patched dist/404.html with default OG shell\n');
}

const TOUR_DETAIL_ROUTE_PATTERN = /^\/tours\/(winter|spring|summer|fall)\/[^/]+$/;

async function prerenderRoute(page, routePath, basePath, previewBaseUrl) {
  const targetUrl = routeToAbsoluteUrl(routePath, previewBaseUrl);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  // Short settle; the content-commit waitForFunction below is the real gate.
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});

  await page.waitForFunction(
    ({ path, requireTourMain }) => {
      // Lazy route chunks and lazy children make the Suspense boundary flip back to
      // RouteFallback while content streams in; capturing during that window yields an
      // empty pulse placeholder with a stale (lingering) og:title. Wait until no
      // RouteFallback is mounted, i.e. the real route content has committed.
      if (document.querySelector('[data-route-fallback]') != null) return false;
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
      if (!canonical) return false;
      if (requireTourMain) {
        // Tour pages gate content behind the runtime schedule. The transient
        // loading/not-found states also carry an og:title with '|', so wait for the
        // committed tour view marker (set by both the full and in-development pages).
        return (
          document.querySelector('[data-testid="tour-detail-main"]') != null &&
          canonical.includes(path)
        );
      }
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '';
      if (!ogTitle.trim()) return false;
      if (path === '/') {
        return ogTitle.includes('Вкрайности') && !ogTitle.includes('|');
      }
      return ogTitle.includes('|') && canonical.includes(path);
    },
    { path: routePath, requireTourMain: TOUR_DETAIL_ROUTE_PATTERN.test(routePath) },
    { timeout: 60_000 },
  );

  // Tour detail pages swap from a loading shell to the full view once the schedule
  // loads; react-helmet-async flushes JSON-LD in a deferred effect after the body
  // commits. Wait for the JSON-LD to land so prerendered HTML carries structured
  // data. Best-effort (catch): pages without JSON-LD (seasons, in-development tours)
  // simply proceed after the timeout.
  const expectsJsonLd =
    routePath === '/' || /^\/tours\/(winter|spring|summer|fall)\/[^/]+$/.test(routePath);
  if (expectsJsonLd) {
    await page
      .waitForFunction(() => document.querySelector('script[type="application/ld+json"]') != null, {
        timeout: 10_000,
      })
      .catch(() => {});
  }

  const html = await page.content();
  await writePrerenderedHtml(routePath, html);
}

const run = async () => {
  let allRoutes = await getRenderableRoutePaths(rootDir);
  // Local iteration: PRERENDER_ONLY="/,/tours/winter/winter-1" limits the route set.
  const only = (process.env.PRERENDER_ONLY || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (only.length > 0) {
    allRoutes = allRoutes.filter((route) => only.includes(route));
  }
  // Prerender `/` last so index.html stays a pristine SPA shell for ?p= deep links.
  const routes = [
    ...allRoutes.filter((route) => route !== '/'),
    ...(allRoutes.includes('/') ? ['/'] : []),
  ];
  const previewBaseUrl = buildPreviewBaseUrl();

  let previewChild = null;
  try {
    try {
      await waitForPreviewReady(previewBaseUrl, 2_000);
      process.stdout.write(`Reusing preview server at ${previewBaseUrl}\n`);
    } catch {
      const server = await startPreviewServer();
      previewChild = server.child;
      await waitForPreviewReady(previewBaseUrl);
    }
    process.stdout.write(`Prerender preview: ${previewBaseUrl} (${routes.length} routes)\n`);

    const browser = await chromium.launch();
    try {
      const context = await browser.newContext({ bypassCSP: true });

      // Serve the bundled schedule catalog from dist. The built app fetches it from the
      // CDN (CORS-restricted from the preview origin) or a base path; routing it to the
      // local files keeps prerender hermetic and lets tour pages reach their committed,
      // schedule-resolved state (full or in-development) instead of the error/not-found
      // shell. ponytail: relies on the dist fixture catalog — if it drifts from the live
      // CDN catalog, refresh public/data before building (upgrade path: pull live catalog in CI).
      await context.route('**/tour-schedule/*.json', async (route) => {
        const requestUrl = route.request().url();
        const fileName = requestUrl.includes('tours_list.json') ? 'tours_list.json' : 'schedule.json';
        try {
          const body = await readFile(resolve(distDir, 'data/tour-schedule', fileName), 'utf8');
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body,
          });
        } catch {
          await route.continue();
        }
      });

      const basePath = normalizeBasePath();
      for (const routePath of routes) {
        const page = await context.newPage();
        try {
          await prerenderRoute(page, routePath, basePath, previewBaseUrl);
          process.stdout.write(`[prerender] ${routePath}\n`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Prerender failed for ${routePath}: ${message}`);
        } finally {
          await page.close();
        }
      }

      await context.close();
    } finally {
      await browser.close();
    }

    await patch404Shell();
    process.stdout.write(`Prerender complete: ${routes.length} routes\n`);
  } finally {
    await stopPreviewServer(previewChild);
  }
};

run().catch((error) => {
  process.stderr.write(
    `prerender-dist failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
