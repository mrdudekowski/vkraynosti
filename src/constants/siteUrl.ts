/** Default canonical origin (prod) when VITE_SITE_URL is unset. */
export const DEFAULT_SITE_URL = 'https://vkraynosti.ru' as const;

/** Production/staging site origin for SEO, OG, sitemap (override via VITE_SITE_URL). */
export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.trim() || DEFAULT_SITE_URL;
