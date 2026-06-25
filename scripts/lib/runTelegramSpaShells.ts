import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { ROUTES } from '../../src/constants/routes.ts';
import { injectDataSsgIntoHtml } from './injectDataSsgIntoHtml.ts';
import { resolveSiteRoot } from './seoRoutes.mjs';
import { routePathToDistFile } from './seoRoutes.mjs';

/** CSR-only Mini App routes: empty #root shell, no data-SSG body, no home OG meta. */
export const TELEGRAM_CSR_SHELL_ROUTE_PATHS = [
  ROUTES.TELEGRAM,
  ROUTES.TELEGRAM_SUCCESS,
] as const;

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
): Promise<void> {
  for (const routePath of TELEGRAM_CSR_SHELL_ROUTE_PATHS) {
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
