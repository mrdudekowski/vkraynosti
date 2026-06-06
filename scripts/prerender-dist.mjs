import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import {
  getIndexableRoutePaths,
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

function startPreviewServer() {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      'npm',
      ['run', 'preview', '--', '--host', previewHost, '--port', String(previewPort), '--strictPort'],
      {
        cwd: rootDir,
        shell: true,
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

    resolvePromise({
      child,
      stop: () => {
        if (!child.killed) child.kill('SIGTERM');
      },
    });
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

async function prerenderRoute(page, routePath, basePath, previewBaseUrl) {
  const targetUrl = routeToAbsoluteUrl(routePath, previewBaseUrl);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

  await page.waitForFunction(
    (path) => {
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '';
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
      if (!ogTitle.trim() || !canonical) return false;
      if (path === '/') {
        return ogTitle.includes('Вкрайности') && !ogTitle.includes('|');
      }
      return ogTitle.includes('|') && canonical.includes(path);
    },
    routePath,
    { timeout: 60_000 },
  );
  const html = await page.content();
  await writePrerenderedHtml(routePath, html);
}

const run = async () => {
  const allRoutes = await getIndexableRoutePaths(rootDir);
  // Prerender `/` last so index.html stays a pristine SPA shell for ?p= deep links.
  const routes = [...allRoutes.filter((route) => route !== '/'), '/'];
  const previewBaseUrl = buildPreviewBaseUrl();

  let child = null;
  let stop = () => {};
  try {
    try {
      await waitForPreviewReady(previewBaseUrl, 2_000);
      process.stdout.write(`Reusing preview server at ${previewBaseUrl}\n`);
    } catch {
      const server = await startPreviewServer();
      child = server.child;
      stop = server.stop;
      await waitForPreviewReady(previewBaseUrl);
    }
    process.stdout.write(`Prerender preview: ${previewBaseUrl} (${routes.length} routes)\n`);

    const browser = await chromium.launch();
    try {
      const context = await browser.newContext();

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
    if (child) {
      stop();
    }
  }
};

run().catch((error) => {
  process.stderr.write(
    `prerender-dist failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
