import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DOCUMENT_COLOR_SCHEME } from '../../src/constants/documentColorScheme.ts';
import { DEFAULT_OG_SHELL_BANNER_LOGICAL } from '../../src/constants/images.ts';
import { SEO_DEFAULTS } from '../../src/constants/seo.ts';
import { renderOgShellHead, stripOgShellMetaFromHead } from './renderOgShellHead.ts';
import {
  isTimewebAppBuild,
  stripGithubPages404RedirectScript,
  stripGithubPagesSpaRedirectScript,
} from './stripGithubPagesScripts.ts';
import type { OgShellMeta } from './resolveOgShellMeta.ts';

function normalizeBasePath(env = process.env): string {
  const raw = (env.VITE_BASE_PATH || '/vkraynosti/').trim();
  if (!raw || raw === '/') return '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

export async function patch404OgShell(distDir: string): Promise<void> {
  const filePath = resolve(distDir, '404.html');
  let html: string;
  try {
    html = await readFile(filePath, 'utf8');
  } catch {
    return;
  }

  const basePath = normalizeBasePath();
  const faviconLightHref =
    basePath === '/' ? '/flavicon-light.png' : `${basePath}flavicon-light.png`;
  const faviconDarkHref =
    basePath === '/' ? '/flavicon-dark.png' : `${basePath}flavicon-dark.png`;
  const appleTouchIconHref =
    basePath === '/' ? '/apple-touch-icon.png' : `${basePath}apple-touch-icon.png`;

  const meta: OgShellMeta = {
    title: SEO_DEFAULTS.home.title,
    description: SEO_DEFAULTS.home.description,
    path: SEO_DEFAULTS.home.path,
    robots: 'noindex,nofollow',
    imagePathOrUrl: DEFAULT_OG_SHELL_BANNER_LOGICAL.replace(/\.webp$/i, '.jpg'),
  };

  let patched = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${SEO_DEFAULTS.home.title}</title>`,
  );
  patched = stripOgShellMetaFromHead(patched);
  if (isTimewebAppBuild()) {
    patched = stripGithubPages404RedirectScript(patched);
    patched = stripGithubPagesSpaRedirectScript(patched);
  }

  const faviconBlock = `
    <meta name="color-scheme" content="${DOCUMENT_COLOR_SCHEME}" />
    <link rel="icon" type="image/png" href="${faviconLightHref}" media="(prefers-color-scheme: light)" />
    <link rel="icon" type="image/png" href="${faviconDarkHref}" media="(prefers-color-scheme: dark)" />
    <link rel="icon" type="image/png" href="${faviconLightHref}" />
    <link rel="apple-touch-icon" href="${appleTouchIconHref}" />`;

  patched = patched.replace('</head>', `${faviconBlock}${renderOgShellHead(meta)}\n  </head>`);
  await writeFile(filePath, patched, 'utf8');
  process.stdout.write('Patched dist/404.html with App-origin OG shell\n');
}
