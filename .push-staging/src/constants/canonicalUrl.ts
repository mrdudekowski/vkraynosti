/**
 * Normalize SPA path for canonical / og:url / twitter:url.
 * Query and hash are stripped; non-root paths get a trailing slash.
 */
export const normalizeCanonicalPath = (path: string): string => {
  let pathname = path.trim();

  if (/^https?:\/\//i.test(pathname)) {
    pathname = new URL(pathname).pathname;
  } else {
    pathname = pathname.split('#')[0]?.split('?')[0] ?? pathname;
  }

  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  pathname = pathname.replace(/\/{2,}/g, '/');

  if (pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname : `${pathname}/`;
};

/** Absolute canonical URL from site origin + path. */
export const buildCanonicalUrl = (siteUrl: string, path: string): string => {
  const origin = siteUrl.replace(/\/+$/, '');
  const normalizedPath = normalizeCanonicalPath(path);
  return normalizedPath === '/' ? `${origin}/` : `${origin}${normalizedPath}`;
};
