import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DEFAULT_OG_SHELL_BANNER_LOGICAL } from '../../src/constants/images.ts';
import { buildCanonicalUrl } from '../../src/constants/canonicalUrl.ts';
import { normalizeMetaContent } from '../../src/constants/metaContent.ts';
import type { OgShellMeta } from './resolveOgShellMeta.ts';
import { ensureTelegramFriendlyOgImage } from './ogShellTelegramImage.ts';
import { escapeHtml, renderOgShellHead } from './renderOgShellHead.ts';

export interface StaticOgTestPageConfig {
  route: string;
  distDirName: string;
  imageLogical: string;
  sourceLogical: string;
  title: string;
  description: string;
  bodyText: string;
  robots?: OgShellMeta['robots'];
}

async function materializeSourceImage(
  distDir: string,
  rootDir: string,
  sourceLogical: string,
): Promise<void> {
  const targetPath = resolve(distDir, sourceLogical);
  await mkdir(dirname(targetPath), { recursive: true });

  const localBanner = resolve(rootDir, 'public', DEFAULT_OG_SHELL_BANNER_LOGICAL);
  if (existsSync(localBanner)) {
    await copyFile(localBanner, targetPath);
    return;
  }

  const cdn = process.env.VITE_PUBLIC_ASSET_BASE_URL?.trim();
  if (!cdn) {
    throw new Error(`OG test source missing in public/ and CDN env unset: ${sourceLogical}`);
  }
  const base = cdn.endsWith('/') ? cdn : `${cdn}/`;
  const response = await fetch(`${base}${DEFAULT_OG_SHELL_BANNER_LOGICAL}`);
  if (!response.ok) {
    throw new Error(`OG test source CDN HTTP ${response.status}`);
  }
  await writeFile(targetPath, Buffer.from(await response.arrayBuffer()));
}

/** Minimal static HTML for Telegram OG A/B testing (no SPA, no Helmet, no GH Pages script). */
export async function generateStaticOgTestPage(
  distDir: string,
  rootDir: string,
  config: StaticOgTestPageConfig,
): Promise<void> {
  await materializeSourceImage(distDir, rootDir, config.sourceLogical);
  await ensureTelegramFriendlyOgImage(distDir, config.sourceLogical);

  const meta: OgShellMeta = {
    title: config.title,
    description: config.description,
    path: config.route,
    robots: config.robots ?? 'noindex,nofollow',
    imagePathOrUrl: config.imageLogical,
  };

  const siteUrl = process.env.VITE_SITE_URL?.trim() || 'https://example.com';
  const title = escapeHtml(normalizeMetaContent(meta.title));
  const html = `<!doctype html>
<html lang="ru" prefix="og: https://ogp.me/ns#">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>${renderOgShellHead(meta)}
  </head>
  <body>${escapeHtml(config.bodyText)}</body>
</html>
`;

  const filePath = resolve(distDir, config.distDirName, 'index.html');
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, html, 'utf8');
  process.stdout.write(
    `[og-shell] ${config.route}/ (static test, canonical ${buildCanonicalUrl(siteUrl, config.route)})\n`,
  );
}

export const OG_TEST_ROUTE = '/og-test' as const;
export const OG_TEST_IMAGE_LOGICAL = 'og-test/cover.jpg' as const;

export async function generateOgTestShell(distDir: string, rootDir: string): Promise<void> {
  await generateStaticOgTestPage(distDir, rootDir, {
    route: OG_TEST_ROUTE,
    distDirName: 'og-test',
    imageLogical: OG_TEST_IMAGE_LOGICAL,
    sourceLogical: 'og-test/cover.webp',
    title: 'OG Test | Вкрайности',
    description: 'Контрольная страница для проверки Telegram preview.',
    bodyText: 'OG Test',
  });
}

export const TELEGRAM_OG_TEST_ROUTE = '/og-test-telegram-20260610' as const;
export const TELEGRAM_OG_TEST_IMAGE_LOGICAL =
  'og-test-telegram-20260610/cover-20260610.jpg' as const;

export async function generateTelegramOgTestShell20260610(
  distDir: string,
  rootDir: string,
): Promise<void> {
  await generateStaticOgTestPage(distDir, rootDir, {
    route: TELEGRAM_OG_TEST_ROUTE,
    distDirName: 'og-test-telegram-20260610',
    imageLogical: TELEGRAM_OG_TEST_IMAGE_LOGICAL,
    sourceLogical: 'og-test-telegram-20260610/cover-20260610.webp',
    title: 'Telegram OG Test | Вкрайности',
    description: 'Контрольная страница для проверки Telegram preview.',
    bodyText: 'Telegram OG Test',
  });
}
