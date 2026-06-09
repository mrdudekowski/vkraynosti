import {
  SEO_DEFAULTS,
  getAbsoluteOgImageUrl,
  getCanonicalUrl,
} from '../../src/constants/seo.ts';
import type { OgShellMeta } from './resolveOgShellMeta.ts';

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
  const ogImage = escapeHtml(getAbsoluteOgImageUrl(meta.imagePathOrUrl));
  const siteName = escapeHtml(SEO_DEFAULTS.siteName);
  const twitterCard = escapeHtml(SEO_DEFAULTS.twitterCard);

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
      <meta property="og:image" content="${ogImage}" />
      <meta property="og:image:alt" content="${title}" />
      <meta name="twitter:card" content="${twitterCard}" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${ogImage}" />
      <meta name="twitter:url" content="${canonicalUrl}" />`;
};

export const injectOgShellIntoHtml = (templateHtml: string, meta: OgShellMeta): string => {
  const titleEscaped = escapeHtml(meta.title);
  const withTitle = templateHtml.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${titleEscaped}</title>`,
  );

  if (withTitle.includes('property="og:title"')) {
    return withTitle;
  }

  return withTitle.replace('</head>', `${renderOgShellHead(meta)}\n  </head>`);
};
