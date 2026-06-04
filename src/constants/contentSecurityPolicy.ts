/**
 * SSOT for Content-Security-Policy (index.html meta + Vite dev/preview headers).
 * CDN/S3 media origin is injected at build time from VITE_PUBLIC_ASSET_BASE_URL.
 */

const IMG_SRC_BASE = [
  "'self'",
  'data:',
  'https://placehold.co',
  'https://mc.yandex.ru',
] as const;

const MEDIA_SRC_BASE = ["'self'", 'blob:'] as const;

function uniqueOrigins(origins: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const origin of origins) {
    const trimmed = origin.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function joinSources(base: readonly string[], extraMediaOrigins: string[]): string {
  return [...base, ...uniqueOrigins(extraMediaOrigins)].join(' ');
}

/**
 * Extract https origin for CSP from VITE_PUBLIC_ASSET_BASE_URL (web-vkr / TimeWeb).
 */
export function parseMediaOriginFromAssetBaseUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

/** Full CSP directive string for meta tag and response headers. */
export function buildContentSecurityPolicy(extraMediaOrigins: string[] = []): string {
  const imgSrc = joinSources(IMG_SRC_BASE, extraMediaOrigins);
  const mediaSrc = joinSources(MEDIA_SRC_BASE, extraMediaOrigins);

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "script-src 'self' 'unsafe-inline' https://mc.yandex.ru",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src ${imgSrc}`,
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://script.google.com https://script.googleusercontent.com https://mc.yandex.ru https://yandex.ru",
    `media-src ${mediaSrc}`,
    'upgrade-insecure-requests',
  ].join('; ');
}
