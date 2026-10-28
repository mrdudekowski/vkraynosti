import {
  SEO_DEFAULTS,
  SEO_SHELL_TAG_ATTRIBUTE,
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
  const keywords = meta.keywords?.length ? `<meta name="keywords" content="${escapeHtml(meta.keywords.join(', '))}" />` : '';
  const robots = escapeHtml(meta.robots);
  const canonicalUrl = escapeHtml(getCanonicalUrl(meta.canonicalPath ?? meta.path));
  const includeSocialMetadata = meta.includeSocialMetadata !== false;
  const ogImage = includeSocialMetadata
    ? escapeHtml(getOgShellAbsoluteImageUrl(meta.imagePathOrUrl))
    : '';
  const siteName = escapeHtml(SEO_DEFAULTS.siteName);
  const twitterCard = escapeHtml(SEO_DEFAULTS.twitterCard);
  const ogImageDimensions = includeSocialMetadata && isJpegOgImagePath(meta.imagePathOrUrl)
    ? `
      <meta property="og:image:secure_url" content="${ogImage}" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="${OG_SHELL_IMAGE_WIDTH}" />
      <meta property="og:image:height" content="${OG_SHELL_IMAGE_HEIGHT}" />`
    : '';

  const socialTags = includeSocialMetadata
    ? `
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
      <meta name="twitter:url" content="${canonicalUrl}" />`
    : '';

  return `
      <meta name="description" content="${description}" />
      <meta name="robots" content="${robots}" />
      <link rel="canonical" href="${canonicalUrl}" />
      ${socialTags}${keywords}`.replace(
    /<(meta|link)\b([^>]*?)(\s*\/)?>/g,
    `<$1$2 ${SEO_SHELL_TAG_ATTRIBUTE}="true"$3>`,
  );
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

const stripOgHtmlPrefix = (html: string): string =>
  html.replace(/\s+prefix=["'][^"']*og:[^"']*["']/i, '');

/** Remove previously injected OG-shell meta so re-runs stay idempotent. */
export const stripOgShellMetaFromHead = (html: string): string =>
  html
    .replace(/<meta\b[^>]*\bname="description"[^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname="keywords"[^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname="robots"[^>]*>\s*/gi, '')
    .replace(/<link\b[^>]*\brel="canonical"[^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bproperty="og:[^"]+"[^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname="twitter:[^"]+"[^>]*>\s*/gi, '');

const insertShellAtStartOfHead = (html: string, shell: string): string => {
  const charset = /<meta\s+charset=["'][^"']+["']\s*\/?>/i;
  if (charset.test(html)) {
    return html.replace(charset, (match) => `${match}\n${shell}`);
  }
  return html.replace(/<head[^>]*>/i, (match) => `${match}\n${shell}`);
};

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
  html = normalizedMeta.includeSocialMetadata === false
    ? stripOgHtmlPrefix(html)
    : ensureOgHtmlPrefix(html);
  html = stripOgShellMetaFromHead(html);
  if (isTimewebAppBuild()) {
    html = stripGithubPagesSpaRedirectScript(html);
  }
  return insertShellAtStartOfHead(html, renderOgShellHead(normalizedMeta));
};
