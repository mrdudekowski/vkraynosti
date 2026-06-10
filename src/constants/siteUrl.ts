import { readViteEnv } from './readViteEnv';

/** Default canonical origin (prod) when VITE_SITE_URL is unset. */
export const DEFAULT_SITE_URL = 'https://vkraynosti.ru' as const;

/** Production/staging site origin for SEO, OG, sitemap (override via VITE_SITE_URL). */
export const SITE_URL = readViteEnv('VITE_SITE_URL') || DEFAULT_SITE_URL;
