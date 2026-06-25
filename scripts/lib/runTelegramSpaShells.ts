import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { ROUTES } from '../../src/constants/routes.ts';
import { injectDataSsgIntoHtml } from './injectDataSsgIntoHtml.ts';
import { getTourStatusByPublicPath, resolveSiteRoot, routePathToDistFile } from './seoRoutes.mjs';

const TOUR_PUBLIC_PATH_PATTERN = /^\/tours\/(winter|spring|summer|fall)\/([^/]+)$/;

/** Статические CSR-маршруты Mini App (без query). */
export const TELEGRAM_CSR_STATIC_ROUTE_PATHS = [
  ROUTES.TELEGRAM,
  ROUTES.TELEGRAM_SUCCESS,
] as const;

/** Все пути Mini App для dist (index.html на каждый URL), без правки Caddy try_files. */
export async function collectTelegramCsrShellRoutePaths(
  rootDir: string = process.cwd(),
): Promise<string[]> {
  const statusByPath = await getTourStatusByPublicPath(rootDir);
  const tourPaths = [...statusByPath.keys()].flatMap(publicPath => {
    const match = TOUR_PUBLIC_PATH_PATTERN.exec(publicPath);
    if (match == null) {
      return [];
    }
    const [, season, slug] = match;
    const tourBase = `${ROUTES.TELEGRAM}/tour/${season}/${slug}`;
    return [tourBase, `${tourBase}/request`];
  });

  return [...new Set([...TELEGRAM_CSR_STATIC_ROUTE_PATHS, ...tourPaths])];
}

const stripIndexableHeadMeta = (html: string): string =>
  html
    .replace(/\s*<link rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<meta name="robots"[^>]*>/gi, '')
    .replace(/\s*<meta property="og:[^"]*"[^>]*>/gi, '')
    .replace(/\s*<meta name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/\s*<meta name="description"[^>]*>/gi, '');

const patchTelegramMiniAppShellHead = (html: string, routePath: string): string => {
  const siteRoot = resolveSiteRoot();
  const canonicalUrl = `${siteRoot}${routePath.startsWith('/') ? routePath : `/${routePath}`}`;
  let patched = stripIndexableHeadMeta(html).replace(
    /<title>[\s\S]*?<\/title>/i,
    '<title>ВКРАЙНОСТИ — Туры по Приморью</title>',
  );
  patched = patched.replace(
    '</head>',
    `    <meta name="robots" content="noindex,nofollow" />\n    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`,
  );
  return patched;
};

export async function runTelegramSpaShells(
  distDir: string,
  spaShellTemplate: string,
  tourScheduleBootstrapJson: string,
  rootDir: string = process.cwd(),
): Promise<void> {
  const routePaths = await collectTelegramCsrShellRoutePaths(rootDir);
  process.stdout.write(`Telegram CSR shells: ${routePaths.length} routes\n`);

  for (const routePath of routePaths) {
    const html = patchTelegramMiniAppShellHead(
      injectDataSsgIntoHtml(spaShellTemplate, {
        bodyHtml: '',
        structuredData: [],
        tourScheduleBootstrapJson,
      }),
      routePath,
    );
    const filePath = routePathToDistFile(routePath, distDir);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, html, 'utf8');
    process.stdout.write(`[telegram-spa-shell] ${routePath}\n`);
  }
}
