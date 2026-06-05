/** Default canonical origin (GitHub Pages) until VITE_SITE_URL is set for TimeWeb cutover. */
export const DEFAULT_SITE_URL = 'https://mrdudekowski.github.io/vkraynosti' as const;

/** Production/staging site origin for SEO, OG, sitemap (override via VITE_SITE_URL). */
export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.trim() || DEFAULT_SITE_URL;
