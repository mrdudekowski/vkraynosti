import { SITE_URL } from '../constants/siteUrl';

/** Public CMS CDN that stores site-content media and seeded team portraits. */
export const SITE_CONTENT_PUBLIC_MEDIA_ORIGIN = 'https://ypnmfvotln.cdn.twcstorage.ru';

export function resolveSiteContentAssetUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return trimmed;
  }
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?\/legal\//i.test(trimmed)) {
    return `${SITE_URL.replace(/\/+$/, '')}${trimmed.replace(/^https?:\/\/[^/]+/i, '')}`;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return trimmed;
  }
  return `${SITE_CONTENT_PUBLIC_MEDIA_ORIGIN}/${trimmed.replace(/^\/+/, '')}`;
}
