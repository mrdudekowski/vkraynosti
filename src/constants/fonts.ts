/**
 * Единственный источник имён семей и URL загрузки веб-шрифтов (Google Fonts).
 * Не дублировать имена в tailwind.config или CSS — только отсюда.
 *
 * Заголовки: Geologica (wght 100–900, CRSV 0).
 * @see https://fonts.google.com/share?selection.family=Geologica:wght,CRSV@100..900,0
 *
 * Вордмарк «Вкрайности» + заголовок героя: Dela Gothic One (`font-brand-wordmark`).
 */

export const FONT_FAMILY_HEADING = 'Geologica' as const;
export const FONT_FAMILY_BRAND_WORDMARK = 'Dela Gothic One' as const;
export const FONT_FAMILY_BODY = 'Source Sans 3' as const;
export const FONT_FAMILY_HERO_PHRASE = 'WDXL Lubrifont TC' as const;

/** Tailwind: `font-heading` (не `font-display` — путаница с CSS-свойством font-display в @font-face). */
export const TAILWIND_FONT_HEADING_CLASS = 'font-heading' as const;

export const fontFamilyHeadingStack: [string, ...string[]] = [
  `"${FONT_FAMILY_HEADING}"`,
  'system-ui',
  'sans-serif',
];

export const fontFamilyBrandWordmarkStack: [string, ...string[]] = [
  `"${FONT_FAMILY_BRAND_WORDMARK}"`,
  'system-ui',
  'sans-serif',
];

export const fontFamilyBodyStack: [string, ...string[]] = [
  `"${FONT_FAMILY_BODY}"`,
  'sans-serif',
];

export const fontFamilyHeroPhraseStack: [string, ...string[]] = [
  `"${FONT_FAMILY_HERO_PHRASE}"`,
  'Georgia',
  'serif',
];

/** Моноширинный стек без несуществующего в проекте JetBrains Mono. */
export const fontFamilyMonoStack: [string, ...string[]] = [
  'ui-monospace',
  'SFMono-Regular',
  'Menlo',
  'Monaco',
  'Consolas',
  'Liberation Mono',
  'Courier New',
  'monospace',
];

const GOOGLE_FONTS_CSS2 = 'https://fonts.googleapis.com/css2';

/** Один запрос: Geologica + Dela Gothic One + Source Sans 3 + WDXL. */
export const GOOGLE_FONTS_STYLESHEET_HREF =
  `${GOOGLE_FONTS_CSS2}?` +
  [
    'family=Geologica:wght,CRSV@100..900,0',
    'family=Dela+Gothic+One',
    'family=Source+Sans+3:wght@300;400;600',
    'family=WDXL+Lubrifont+TC',
    'display=swap',
  ].join('&');

export const GOOGLE_FONTS_PRECONNECT_API = 'https://fonts.googleapis.com' as const;
export const GOOGLE_FONTS_PRECONNECT_STATIC = 'https://fonts.gstatic.com' as const;
