import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DEFAULT_OG_SHELL_BANNER_LOGICAL } from '../../src/constants/images.ts';
import { getOgShellAbsoluteImageUrl } from '../../src/constants/seo.ts';

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

  if (html.includes('property="og:title"')) {
    return;
  }

  const basePath = normalizeBasePath();
  const faviconLightHref =
    basePath === '/' ? '/flavicon-light.png' : `${basePath}flavicon-light.png`;
  const faviconDarkHref =
    basePath === '/' ? '/flavicon-dark.png' : `${basePath}flavicon-dark.png`;
  const appleTouchIconHref =
    basePath === '/' ? '/apple-touch-icon.png' : `${basePath}apple-touch-icon.png`;
  const ogImage = getOgShellAbsoluteImageUrl(DEFAULT_OG_SHELL_BANNER_LOGICAL);
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

  const patched = html.replace('</head>', `${headInjection}\n  </head>`);
  await writeFile(filePath, patched, 'utf8');
  process.stdout.write('Patched dist/404.html with default OG shell\n');
}
