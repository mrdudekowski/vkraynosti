/**
 * Единственный источник размеров подписи-фразы в HeroCarousel.
 * Гарнитура этой строки: `font-hero-carousel-phrase` (WDXL). Заголовки — `font-heading` (Geologica). Вордмарк в навбаре/герое — `font-brand-wordmark` (Dela Gothic One). Всё в `src/constants/fonts.ts` + `bootstrap-fonts.ts`.
 * Размер задаётся через style в компоненте — так он не теряется из‑за порядка/конфликтов утилит `text-*` в CSS.
 */
export const heroCarouselPhraseTypography = {
  fontSizeClamp: 'clamp(1.875rem, 5.5vw, 3.5rem)',
  lineHeight:    '1.3',
} as const;

/** Для `style={...}` у `<p>` с фразой тура в герое */
export const heroCarouselPhraseTypographyStyle = {
  fontSize:   heroCarouselPhraseTypography.fontSizeClamp,
  lineHeight: heroCarouselPhraseTypography.lineHeight,
} as const;
