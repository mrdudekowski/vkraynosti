import {
  SEO_DEFAULTS,
  getCanonicalUrl,
  getOgShellAbsoluteImageUrl,
} from '../../src/constants/seo.ts';
import { normalizeMetaContent } from '../../src/constants/metaContent.ts';
import type { OgShellMeta } from './resolveOgShellMeta.ts';
import {
  OG_SHELL_IMAGE_HEIGHT,
  OG_SHELL_IMAGE_WIDTH,
  isJpegOgImagePath,
} from './ogShellTelegramImage.ts';
import {
  isTimewebAppBuild,
  stripGithubPagesSpaRedirectScript,
} from './stripGithubPagesScripts.ts';

export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const shellText = (value: string): string => escapeHtml(normalizeMetaContent(value));

/** Meta block aligned with `PageMeta.tsx` (no preload / JSON-LD — bots only need OG). */
export const renderOgShellHead = (meta: OgShellMeta): string => {
  const title = shellText(meta.title);
  const description = shellText(meta.description);
  const robots = escapeHtml(meta.robots);
  const canonicalUrl = escapeHtml(getCanonicalUrl(meta.canonicalPath ?? meta.path));
  const ogImage = escapeHtml(getOgShellAbsoluteImageUrl(meta.imagePathOrUrl));
  const siteName = escapeHtml(SEO_DEFAULTS.siteName);
  const twitterCard = escapeHtml(SEO_DEFAULTS.twitterCard);
  const ogImageDimensions = isJpegOgImagePath(meta.imagePathOrUrl)
    ? `
      <meta property="og:image:secure_url" content="${ogImage}" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="${OG_SHELL_IMAGE_WIDTH}" />
      <meta property="og:image:height" content="${OG_SHELL_IMAGE_HEIGHT}" />`
    : '';

  return `
      <meta name="description" content="${description}" />
      <meta name="robots" content="${robots}" />
      <link rel="canonical" href="${canonicalUrl}" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="${siteName}" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:url" content="${canonicalUrl}" />
      <meta property="og:image" content="${ogImage}" />${ogImageDimensions}
      <meta property="og:image:alt" content="${title}" />
      <meta name="twitter:card" content="${twitterCard}" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${ogImage}" />
      <meta name="twitter:url" content="${canonicalUrl}" />`;
};

const ensureOgHtmlPrefix = (html: string): string => {
  if (/prefix=["']og:/i.test(html)) {
    return html;
  }
  return html.replace(
    /<html(\s[^>]*)?>/i,
    (match, attrs = '') =>
      attrs.includes('prefix=')
        ? match
        : `<html${attrs} prefix="og: https://ogp.me/ns#">`,
  );
};

/** Remove previously injected OG-shell meta so re-runs stay idempotent. */
export const stripOgShellMetaFromHead = (html: string): string =>
  html
    .replace(/<meta\s+name="description"[^>]*>\s*/gi, '')
    .replace(/<meta\s+name="robots"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, '');

export const injectOgShellIntoHtml = (templateHtml: string, meta: OgShellMeta): string => {
  const normalizedMeta: OgShellMeta = {
    ...meta,
    title: normalizeMetaContent(meta.title),
    description: normalizeMetaContent(meta.description),
  };
  const titleEscaped = escapeHtml(normalizedMeta.title);
  let html = templateHtml.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${titleEscaped}</title>`,
  );
  html = ensureOgHtmlPrefix(html);
  html = stripOgShellMetaFromHead(html);
  if (isTimewebAppBuild()) {
    html = stripGithubPagesSpaRedirectScript(html);
  }
  return html.replace('</head>', `${renderOgShellHead(normalizedMeta)}\n  </head>`);
};
