import {
  SEO_DEFAULTS,
  getCanonicalUrl,
  getOgShellAbsoluteImageUrl,
} from '../../src/constants/seo.ts';
import type { OgShellMeta } from './resolveOgShellMeta.ts';
import { isJpegOgImagePath } from './ogShellTelegramImage.ts';

export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Meta block aligned with `PageMeta.tsx` (no preload / JSON-LD — bots only need OG). */
export const renderOgShellHead = (meta: OgShellMeta): string => {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const robots = escapeHtml(meta.robots);
  const canonicalUrl = escapeHtml(getCanonicalUrl(meta.canonicalPath ?? meta.path));
  const ogImage = escapeHtml(getOgShellAbsoluteImageUrl(meta.imagePathOrUrl));
  const siteName = escapeHtml(SEO_DEFAULTS.siteName);
  const twitterCard = escapeHtml(SEO_DEFAULTS.twitterCard);
  const ogImageType = isJpegOgImagePath(meta.imagePathOrUrl)
    ? '\n      <meta property="og:image:type" content="image/jpeg" />'
    : '';

  return `
      <meta name="description" content="${description}" />
      <meta name="robots" content="${robots}" />
      <link rel="canonical" href="${canonicalUrl}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${canonicalUrl}" />
      <meta property="og:site_name" content="${siteName}" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:image" content="${ogImage}" />${ogImageType}
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

export const injectOgShellIntoHtml = (templateHtml: string, meta: OgShellMeta): string => {
  const titleEscaped = escapeHtml(meta.title);
  const withTitle = templateHtml.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${titleEscaped}</title>`,
  );

  const withPrefix = ensureOgHtmlPrefix(withTitle);

  if (withPrefix.includes('property="og:title"')) {
    return withPrefix;
  }

  return withPrefix.replace('</head>', `${renderOgShellHead(meta)}\n  </head>`);
};
