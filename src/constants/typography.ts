/**
 * Единственный источник размеров подписи-фразы в HeroCarousel.
 * Фраза тура в Hero: `font-hero-carousel-phrase` + `font-medium` (Nord 500). Заголовки — `font-heading` (Nord 400). Блок заголовка героя (документ + подпись): `font-heading` + `font-bold` (Nord 700). Лого в navbar — `font-brand-wordmark` (Dela Gothic One). Размеры фразы — ниже. Загрузка: `src/constants/fonts.ts`, `index.css` (@font-face Nord), `bootstrap-fonts.ts` (Google).
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
