/**
 * Имена семей и загрузка шрифтов.
 *
 * Локально: Nord (Light / Regular / Medium / Bold) — `public/fonts/` + `@font-face` в `bootstrap-fonts.ts`.
 * Google Fonts: Dela Gothic One (лого в navbar), Source Sans 3 (body).
 *
 * При смене имён файлов Nord — обновить и этот файл (константы ниже), и `bootstrap-fonts.ts`.
 */

export {
  FONT_FAMILY_NORD,
  FONT_FAMILY_BRAND_WORDMARK,
  FONT_FAMILY_BODY,
  TAILWIND_FONT_HEADING_CLASS,
  fontFamilyHeadingStack,
  fontFamilyHeroPhraseStack,
  fontFamilyBrandWordmarkStack,
  fontFamilyBodyStack,
  fontFamilyMonoStack,
} from './fontFamilyStacks';

/** Файлы в `public/fonts/` (URL: `PUBLIC_ASSET_BASE` + `fonts/` + имя). */
export const NORD_FONT_FILES = {
  light:   'nord_light.ttf',
  regular: 'nord_regular.ttf',
  medium:  'nord_medium.ttf',
  bold:    'nord_bold.ttf',
} as const;

const viteBase = import.meta.env.BASE_URL ?? '/';

export const PUBLIC_ASSET_BASE = viteBase.endsWith('/') ? viteBase : `${viteBase}/`;

/** Абсолютные URL файлов Nord для `@font-face` и preload (подкаталог деплоя). */
export const NORD_FONT_URLS = {
  light:   `${PUBLIC_ASSET_BASE}fonts/${NORD_FONT_FILES.light}`,
  regular: `${PUBLIC_ASSET_BASE}fonts/${NORD_FONT_FILES.regular}`,
  medium:  `${PUBLIC_ASSET_BASE}fonts/${NORD_FONT_FILES.medium}`,
  bold:    `${PUBLIC_ASSET_BASE}fonts/${NORD_FONT_FILES.bold}`,
} as const;

const GOOGLE_FONTS_CSS2 = 'https://fonts.googleapis.com/css2';

/** Только веб-шрифты с Google (Nord — локально в `public/fonts`). */
/** 400/500/600 — под `font-normal` / `font-medium` / `font-semibold` у body (Source Sans 3). */
export const GOOGLE_FONTS_STYLESHEET_HREF =
  `${GOOGLE_FONTS_CSS2}?` +
  [
    'family=Dela+Gothic+One',
    'family=Source+Sans+3:wght@400;500;600',
    'display=swap',
  ].join('&');

export const GOOGLE_FONTS_PRECONNECT_API = 'https://fonts.googleapis.com' as const;
export const GOOGLE_FONTS_PRECONNECT_STATIC = 'https://fonts.gstatic.com' as const;
