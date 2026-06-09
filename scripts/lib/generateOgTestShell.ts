import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DEFAULT_OG_SHELL_BANNER_LOGICAL } from '../../src/constants/images.ts';
import { buildCanonicalUrl } from '../../src/constants/canonicalUrl.ts';
import { normalizeMetaContent } from '../../src/constants/metaContent.ts';
import type { OgShellMeta } from './resolveOgShellMeta.ts';
import { ensureTelegramFriendlyOgImage } from './ogShellTelegramImage.ts';
import { escapeHtml, renderOgShellHead } from './renderOgShellHead.ts';

export const OG_TEST_ROUTE = '/og-test' as const;
export const OG_TEST_IMAGE_LOGICAL = 'og-test/cover.jpg' as const;
const OG_TEST_SOURCE_LOGICAL = 'og-test/cover.webp' as const;

async function materializeOgTestSource(distDir: string, rootDir: string): Promise<void> {
  const targetPath = resolve(distDir, OG_TEST_SOURCE_LOGICAL);
  await mkdir(dirname(targetPath), { recursive: true });

  const localBanner = resolve(rootDir, 'public', DEFAULT_OG_SHELL_BANNER_LOGICAL);
  if (existsSync(localBanner)) {
    await copyFile(localBanner, targetPath);
    return;
  }

  const cdn = process.env.VITE_PUBLIC_ASSET_BASE_URL?.trim();
  if (!cdn) {
    throw new Error('OG test cover: banner missing in public/ and CDN env unset');
  }
  const base = cdn.endsWith('/') ? cdn : `${cdn}/`;
  const response = await fetch(`${base}${DEFAULT_OG_SHELL_BANNER_LOGICAL}`);
  if (!response.ok) {
    throw new Error(`OG test cover: CDN banner HTTP ${response.status}`);
  }
  await writeFile(targetPath, Buffer.from(await response.arrayBuffer()));
}

/** Minimal static shell for Telegram OG debugging (no SPA bundle). */
export async function generateOgTestShell(distDir: string, rootDir: string): Promise<void> {
  await materializeOgTestSource(distDir, rootDir);
  await ensureTelegramFriendlyOgImage(distDir, OG_TEST_SOURCE_LOGICAL);

  const meta: OgShellMeta = {
    title: 'OG Test | Вкрайности',
    description: 'Контрольная страница для проверки Telegram preview.',
    path: OG_TEST_ROUTE,
    robots: 'noindex,nofollow',
    imagePathOrUrl: OG_TEST_IMAGE_LOGICAL,
  };

  const title = escapeHtml(normalizeMetaContent(meta.title));
  const html = `<!doctype html>
<html lang="ru" prefix="og: https://ogp.me/ns#">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>${renderOgShellHead(meta)}
  </head>
  <body>OG Test</body>
</html>
`;

  const filePath = resolve(distDir, 'og-test', 'index.html');
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, html, 'utf8');
  process.stdout.write(
    `[og-shell] ${OG_TEST_ROUTE}/ (static test page, canonical ${buildCanonicalUrl(process.env.VITE_SITE_URL?.trim() || 'https://example.com', OG_TEST_ROUTE)})\n`,
  );
}
