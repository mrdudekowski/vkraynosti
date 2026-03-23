/**
 * Стеки `fontFamily` для Tailwind — без `import.meta` (конфиг Tailwind грузится через jiti).
 * Семантика и URL загрузки — в `fonts.ts`.
 */

export const FONT_FAMILY_NORD = 'Nord' as const;
export const FONT_FAMILY_BRAND_WORDMARK = 'Dela Gothic One' as const;
export const FONT_FAMILY_BODY = 'Source Sans 3' as const;

export const TAILWIND_FONT_HEADING_CLASS = 'font-heading' as const;

export const fontFamilyHeadingStack: [string, ...string[]] = [
  `"${FONT_FAMILY_NORD}"`,
  'system-ui',
  'sans-serif',
];

export const fontFamilyHeroPhraseStack: [string, ...string[]] = [
  `"${FONT_FAMILY_NORD}"`,
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
