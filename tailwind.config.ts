import type { Config } from 'tailwindcss'
import {
  TOUR_INCLUDED_DESCRIPTION_FADE_MS,
  TOUR_INCLUDED_MOTOR_DURATION_MS,
} from './src/constants/tourIncludedHover'
import {
  HOME_SEASON_BANNER_CROSSFADE_MS,
  HOME_SEASON_BANNER_LETTER_EXIT_MS,
  HOME_SEASON_BANNER_LETTER_FADE_IN_MS,
  HOME_SEASON_BANNER_STRIP_FADE_IN_MS,
  HOME_SEASON_BANNER_WORDMARK_SHIMMER_MS,
} from './src/constants/homeSeasonBannerAnimation'
import {
  THEME_TEXT_INVERSE_HEX,
  THEME_TEXT_PRIMARY_HEX,
} from './src/constants/themeTextColors'
import {
  fontFamilyBodyStack,
  fontFamilyBrandWordmarkStack,
  fontFamilyHeadingStack,
  fontFamilyHeroPhraseStack,
  fontFamilyHomeSeasonBannerStack,
  fontFamilyMonoStack,
} from './src/constants/fontFamilyStacks'
import { SEASON_ACCENT_HEX } from './src/constants/seasonAccentHex'
import { HOME_HERO_CEILING_BOUNCE_DURATION_MS } from './src/constants/homeHeroCeiling'
import { HOME_NAVBAR_CHROME_TRANSITION_MS } from './src/constants/homeNavbarChrome'
import { HOME_GATE_SCROLL_HINT_FADE_MS } from './src/constants/homeGateScroll'
import { HOME_GATE_START_SCREEN_HEX } from './src/constants/homeGateSurface'

/** Синхронно с `TOUR_INCLUDED_MOTOR_DURATION_MS` и `transitionDuration.tour-included`. */
const TOUR_INCLUDED_MOTOR_DURATION = `${TOUR_INCLUDED_MOTOR_DURATION_MS}ms` as const

/** Синхронно с `TOUR_INCLUDED_DESCRIPTION_FADE_MS` и fade подписи «Что включено». */
const TOUR_INCLUDED_DESCRIPTION_FADE = `${TOUR_INCLUDED_DESCRIPTION_FADE_MS}ms` as const

/** Синхронно с `HOME_GATE_SCROLL_HINT_FADE_MS` и стрелкой ворот (`HomeGateScrollToHeroLink`). */
const HOME_GATE_SCROLL_HINT_FADE = `${HOME_GATE_SCROLL_HINT_FADE_MS}ms` as const

/** Длительность выезда мобильного меню (синхронно с `animation.mobile-nav-*`). */
const MOBILE_NAV_DURATION = '320ms' as const

/** Согласовано с `spacing.keyframe-fade-up-y` и keyframes `fade-up`. */
const KEYFRAME_FADE_UP_Y = '1.5rem' as const
/** Согласовано с `spacing.keyframe-slide-in-x` и keyframes `slide-in`. */
const KEYFRAME_SLIDE_IN_X = '-1.25rem' as const

const FADE_UP_DURATION = '720ms' as const
const SLIDE_IN_DURATION = '480ms' as const
/** Keyframe `tour-meta-stagger-in` (мета-блок страницы тура). */
const KEYFRAME_TOUR_META_STAGGER_Y = '0.375rem' as const
const SCALE_IN_DURATION = '360ms' as const
const SEASON_FLASH_DURATION = '900ms' as const

/** Отскок при ударе о потолок hero; синхронно с `HOME_HERO_CEILING_BOUNCE_DURATION_MS`. */
const HOME_HERO_CEILING_BOUNCE_DURATION = `${HOME_HERO_CEILING_BOUNCE_DURATION_MS}ms` as const

/** Покачивание стрелки «к hero» на стартовом экране; синхронно с `animation.home-gate-scroll-hint-bob`. */
const HOME_GATE_SCROLL_HINT_BOB_DURATION = '2000ms' as const

/** CTA: зелёный sweep поверх апельсинового `cta.fill` (согласовано с `.btn-cta-tour`). */
const CTA_SWEEP_DURATION = '400ms' as const
const CTA_TEXT_SCALE_DURATION = '300ms' as const
/** Появление букв «Вкрайности» + стрелки в такт `cta-sweep`. */
const CTA_LETTER_STAGGER_MS = '32ms' as const
const CTA_LETTER_POP_DURATION = '100ms' as const

/** SVG-бургер: значения синхронны с `.hamburger-*` в `index.css` (`theme('hamburger.*')`). */
const hamburgerTheme = {
  stroke: '3',
  dashCollapsed: '12 63',
  dashExpanded: '20 300',
  dashOffset: '-32.42',
  rotate: '-45deg',
} as const

/**
 * Пастельные остановки фона страницы по сезону (вертикальный градиент `bg-season-page-*`).
 * Середина тона визуально близка к `colors.seasonBg.*`.
 */
const SEASON_PAGE_GRADIENT_STOPS = {
  winter: { top: '#EEF6FC', bottom: '#C5DFF0' },
  /**
   * Весна: аналоговая смесь персикового и розового (верх — тёплый персик, низ — дымчато-розовый).
   * Такой дуэт часто используют для «цветения» / мягкой энергии без кислотности.
   */
  spring: { top: '#FFF0E8', bottom: '#F0CCD8' },
  summer: { top: '#FFF5E6', bottom: '#F3DFB0' },
  fall: { top: '#FAE8DC', bottom: '#E8C4A8' },
} as const

/**
 * Радиальный «ореол» для слоя размытия (`bg-season-page-atmosphere-*` + `blur-season-page-soft`).
 * База сезона — те же hex, что у `colors.seasonBg.*`.
 */

/** Синхронно с `colors.surface.dark`. */
const SURFACE_DARK_HEX = '#0D0D0D' as const

function buildHomeSeasonBannerWordmarkGradient(
  season: keyof typeof SEASON_ACCENT_HEX
): string {
  const c = SEASON_ACCENT_HEX[season]
  return [
    'linear-gradient(102deg',
    `color-mix(in srgb, ${c} 26%, #ffffff 74%) 0%`,
    `color-mix(in srgb, ${c} 58%, ${SURFACE_DARK_HEX} 42%) 24%`,
    `${c} 48%`,
    `color-mix(in srgb, ${c} 34%, #ffffff 66%) 72%`,
    `color-mix(in srgb, ${c} 62%, ${SURFACE_DARK_HEX} 38%) 100%)`,
  ].join(', ')
}

/** Текст навбара / dock: мягкий объём (`bg-clip-text`), см. `SEASON_TEXT_CLASS`. */
function buildSeasonChromeTextGradient(season: keyof typeof SEASON_ACCENT_HEX): string {
  const c = SEASON_ACCENT_HEX[season]
  const hi = `color-mix(in srgb, ${c} 62%, #ffffff 38%)`
  const deep = `color-mix(in srgb, ${c} 40%, ${SURFACE_DARK_HEX} 60%)`
  return `linear-gradient(148deg, ${hi} 0%, ${c} 46%, ${deep} 100%)`
}

/** Вертикальная полоска-акцент у заголовков тура и блока цены. */
function buildSeasonAccentBarGradient(season: keyof typeof SEASON_ACCENT_HEX): string {
  const c = SEASON_ACCENT_HEX[season]
  const top = `color-mix(in srgb, ${c} 85%, #ffffff 15%)`
  const bot = `color-mix(in srgb, ${c} 32%, ${SURFACE_DARK_HEX} 68%)`
  return `linear-gradient(180deg, ${top} 0%, ${c} 50%, ${bot} 100%)`
}

/** Разделитель над «Команда» на главной: мягкое свечение по центру. */
function buildTeamSectionDividerGradient(season: keyof typeof SEASON_ACCENT_HEX): string {
  const c = SEASON_ACCENT_HEX[season]
  return `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${c} 58%, transparent) 50%, transparent 100%)`
}

function buildSeasonChromeIconDropShadow(season: keyof typeof SEASON_ACCENT_HEX): string {
  const c = SEASON_ACCENT_HEX[season]
  return [
    `0 1px 0 color-mix(in srgb, #ffffff 38%, transparent)`,
    `0 2px 6px color-mix(in srgb, ${c} 48%, ${SURFACE_DARK_HEX} 32%, transparent)`,
  ].join(', ')
}

/** Активные иконки «Что включено» — те же hex, что `colors.tourIncludedIcon.active.*`. */
const TOUR_INCLUDED_ICON_ACTIVE_HEX = {
  winter: '#B45309',
  spring: '#861C44',
  summer: '#0E7490',
  fall: '#14532D',
} as const

function buildTourIncludedActiveVolumeShadow(
  season: keyof typeof TOUR_INCLUDED_ICON_ACTIVE_HEX
): string {
  const c = TOUR_INCLUDED_ICON_ACTIVE_HEX[season]
  return [
    `0 1px 0 color-mix(in srgb, #ffffff 32%, transparent)`,
    `0 5px 12px color-mix(in srgb, #1A1A1A 22%, ${c} 20%, transparent)`,
  ].join(', ')
}

/**
 * Нижний акцент «неба» главной по сезону (пастель `SEASON_PAGE_GRADIENT_STOPS.*` → интенсивный тон).
 * Синхронно с `colors.home-page-sky-intense.*`; зима — прежний насыщенный синий.
 */
const HOME_PAGE_SKY_INTENSE_HEX = {
  winter: '#0E4D7A',
  /** Весна: глубокий розово-терракотовый к пастели «персик + роза». */
  spring: '#8E3E52',
  /** Тёплый янтарь к `colors.season.summer`. */
  summer: '#A16207',
  /** Терракотовый ржавый к `colors.season.fall`. */
  fall: '#9C2F0E',
} as const

/**
 * Доля интенсивного тона на нижнем стопе «неба» / финале безопасности (остальное — пастель / accent).
 * Ниже — мягче общая насыщенность.
 */
const HOME_PAGE_SKY_FINAL_INTENSE_RATIO = 58

function buildHomePageSkyGradient(
  season: keyof typeof SEASON_PAGE_GRADIENT_STOPS
): string {
  const { top, bottom } = SEASON_PAGE_GRADIENT_STOPS[season]
  const intense = HOME_PAGE_SKY_INTENSE_HEX[season]
  const m = (b: number, i: number) =>
    `color-mix(in srgb, ${bottom} ${b}%, ${intense} ${i}%)`
  const r = HOME_PAGE_SKY_FINAL_INTENSE_RATIO
  const fin = `color-mix(in srgb, ${intense} ${r}%, ${bottom} ${100 - r}%)`
  return [
    'linear-gradient(180deg',
    `${top} 0%`,
    `${bottom} 8%`,
    `${m(94, 6)} 21%`,
    `${m(86, 14)} 31%`,
    `${m(76, 24)} 41%`,
    `${m(66, 34)} 50%`,
    `${m(58, 42)} 58%`,
    `${m(52, 48)} 65%`,
    `${m(48, 52)} 71%`,
    `${m(45, 55)} 77%`,
    `${m(43, 57)} 83%`,
    `${m(42, 58)} 90%`,
    `${fin} 100%)`,
  ].join(', ')
}

const HOME_PAGE_SKY_GRADIENT_WINTER = buildHomePageSkyGradient('winter')
const HOME_PAGE_SKY_GRADIENT_SPRING = buildHomePageSkyGradient('spring')
const HOME_PAGE_SKY_GRADIENT_SUMMER = buildHomePageSkyGradient('summer')
const HOME_PAGE_SKY_GRADIENT_FALL = buildHomePageSkyGradient('fall')

/** Синхронно с `colors.brand.primary`. */
const BRAND_PRIMARY_HEX = '#1A3C2E' as const
/** Синхронно с `colors.brand.accent`. */
const BRAND_ACCENT_HEX = '#E8F4F0' as const

const SEASON_PAGE_ATMOSPHERE = {
  winter:
    'radial-gradient(ellipse 115% 85% at 50% -18%, rgba(255,255,255,0.48) 0%, color-mix(in srgb, #D6E8F5 38%, transparent) 42%, transparent 72%)',
  spring:
    'radial-gradient(ellipse 115% 85% at 50% -18%, rgba(255,255,255,0.48) 0%, color-mix(in srgb, #E8B8C6 38%, transparent) 42%, transparent 72%)',
  summer:
    'radial-gradient(ellipse 115% 85% at 50% -18%, rgba(255,255,255,0.5) 0%, color-mix(in srgb, #FDEBC8 40%, transparent) 42%, transparent 72%)',
  fall:
    'radial-gradient(ellipse 115% 85% at 50% -18%, rgba(255,255,255,0.46) 0%, color-mix(in srgb, #F5D5C0 42%, transparent) 42%, transparent 72%)',
} as const

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    { pattern: /^(h|min-h|w)-nav-season-(circle|icon)-(fixed|fluid)$/, variants: ['md', 'max'] },
    // @apply в index.css не подхватывает кастомные font-*; в JSX классы нужны в билде.
    'font-heading',
    'font-brand-wordmark',
    'font-hero-carousel-phrase',
    'text-brand-wordmark-nav',
    'text-tour-detail-section',
    'text-tour-detail-prose',
    'text-tour-detail-hero-subtitle',
    'text-tour-detail-program-heading',
    'text-tour-detail-program-body',
    'text-tour-detail-meta',
    'text-tour-detail-meta-prominent',
    'text-tour-detail-meta-price-prominent',
    'text-tour-detail-included-icon-idle-horizontal',
    'text-tour-detail-included-icon-active-horizontal',
    'text-home-season-strip-label',
    'font-home-season-banner',
    'text-home-season-banner-letter',
    'drop-shadow-home-season-banner-letter',
    'z-home-season-banner',
    'z-30',
    'z-home-gate-letterbox',
    'z-home-gate-glow',
    'z-home-gate-return-veil',
    'z-home-gate-scroll-hint',
    'pb-home-gate-scroll-hint-bottom',
    'px-home-gate-scroll-hint-pad-x',
    'py-home-gate-scroll-hint-pad-y',
    'min-h-home-gate-scroll-hint-target',
    'min-w-home-gate-scroll-hint-target',
    'h-home-gate-scroll-hint-icon',
    'w-home-gate-scroll-hint-icon',
    'motion-safe:animate-home-gate-scroll-hint-bob',
    'duration-home-gate-scroll-hint-fade',
    'bg-home-gate-letterbox',
    'bg-home-gate-start-screen',
    'min-h-home-gate-viewport',
    'z-home-hero',
    'duration-home-navbar-chrome',
    'bg-home-gate-return-veil',
    'top-navbar',
    'duration-home-season-banner-crossfade',
    'duration-home-season-banner-strip-in',
    'duration-home-season-banner-letter-exit',
    'duration-home-season-banner-letter-in',
    'scale-home-season-banner-loop',
    'animate-home-season-banner-letter-wave-exit',
    'animate-home-season-banner-wordmark-shimmer',
    'animate-home-hero-ceiling-bounce',
    'bg-home-season-banner-wordmark-winter',
    'bg-home-season-banner-wordmark-spring',
    'bg-home-season-banner-wordmark-summer',
    'bg-home-season-banner-wordmark-fall',
    'bg-home-season-banner-wordmark-grid',
    'aspect-home-season-banner-inner',
    'min-h-home-season-banner-inner',
    'min-h-home-safety-hero',
    'bg-home-season-banner-stage',
    'from-home-season-strip-btn-from',
    'to-home-season-strip-btn-to',
    { pattern: /^object-tour-detail-hero-desktop(-winter-[34])?$/, variants: ['lg'] },
    'object-gallery-winter-4-gora',
    'bg-preface-winter-3-boarder',
    { pattern: /^animate-tour-included-/ },
    { pattern: /^drop-shadow-tour-included-hover-/ },
    { pattern: /^shadow-season-strip-hover-(winter|spring|summer|fall)$/ },
    { pattern: /^text-tourIncludedIcon-active-/ },
    /** Чтобы `@keyframes cta-letter-pop` попали в бандл (используются из `index.css`, не из утилит). */
    'animate-cta-letter-pop',
    'animate-tour-meta-stagger-in',
    'delay-tour-meta-0',
    'delay-tour-meta-1',
    'delay-tour-meta-2',
    /** `SEASON_PAGE_*` в `seasonTheme.ts` — только строковая подстановка по сезону. */
    { pattern: /^bg-season-page-(winter|spring|summer|fall)$/ },
    { pattern: /^bg-season-page-atmosphere-(winter|spring|summer|fall)$/ },
    { pattern: /^bg-home-page-sky-(winter|spring|summer|fall)$/ },
    /** `TEAM_SECTION_DIVIDER_CLASS` — градиентная линия над «Команда». */
    { pattern: /^bg-team-section-divider-(winter|spring|summer|fall)$/ },
    { pattern: /^bg-season-chrome-text-(winter|spring|summer|fall)$/ },
    { pattern: /^bg-season-accent-bar-(winter|spring|summer|fall)$/ },
    { pattern: /^drop-shadow-season-chrome-icon-(winter|spring|summer|fall)$/ },
    'max-w-team-section-divider',
    'blur-season-page-soft',
    'opacity-season-page-atmosphere',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   BRAND_PRIMARY_HEX,
          secondary: '#C8A96E',
          accent:    BRAND_ACCENT_HEX,
        },
        seasonBg: {
          winter: '#D6E8F5',
          /** Середина между персиком и розой весеннего градиента. */
          spring: '#F5DAD8',
          summer: '#FDEBC8',
          fall:   '#F5D5C0',
        },
        /**
         * Полупрозрачная плашка колонки «Что включено» на фоне сезона (`RevealBox` на TourDetailPage).
         * База — `surface.light` (#F7F5F0), смешивание с прозрачностью.
         */
        tourIncludedColumnPanel:
          'color-mix(in srgb, #F7F5F0 62%, transparent)',
        /**
         * Подложка горизонтального ряда иконок «Что включено» (полупрозрачный «колодец»).
         * Чуть плотнее среднего тона градиента плашки `bg-tour-included-panel`.
         */
        tourIncludedIconStrip:
          'color-mix(in srgb, #F7F5F0 58%, transparent)',
        /**
         * Ряд иконок «Что включено» на фото-префейсе: тёмный полупрозрачный фон на скриме.
         * База — `surface.dark` (#0D0D0D).
         */
        tourIncludedIconStripPreface:
          'color-mix(in srgb, #0D0D0D 55%, transparent)',
        surface: {
          dark:  '#0D0D0D',
          light: '#F7F5F0',
        },
        /**
         * Базовый интенсивный тон для «неба» главной; фактический низ — смешение с пастелью (`HOME_PAGE_SKY_FINAL_INTENSE_RATIO`).
         */
        'home-page-sky-intense': {
          winter: HOME_PAGE_SKY_INTENSE_HEX.winter,
          spring: HOME_PAGE_SKY_INTENSE_HEX.spring,
          summer: HOME_PAGE_SKY_INTENSE_HEX.summer,
          fall: HOME_PAGE_SKY_INTENSE_HEX.fall,
        },
        /** Подложка сетки баннера «В другой сезон» (md+), до появления полосок. */
        'home-season-banner-stage': '#000000',
        /** Letterbox и чёрная вуаль возврата — ворота главной (`useHomeNavbarChromeScroll`). */
        'home-gate-letterbox': SURFACE_DARK_HEX,
        /** Стартовый экран ворот: сплошной фон под баннером (синхронно с `HOME_GATE_START_SCREEN_HEX`). */
        'home-gate-start-screen': HOME_GATE_START_SCREEN_HEX,
        'home-gate-return-veil': SURFACE_DARK_HEX,
        /**
         * Градиент кругов `SeasonSwitcher` в секции главной (на светлой полосе под баннером):
         * на ~20% темнее, чем `from-black/60 to-black/40` в navbar.
         */
        'home-season-strip-btn': {
          from: 'rgb(0 0 0 / 0.72)',
          to: 'rgb(0 0 0 / 0.48)',
        },
        difficulty: {
          easy:   { bg: '#dcfce7', fg: '#166534' },
          medium: { bg: '#fef9c3', fg: '#854d0e' },
          hard:   { bg: '#ffedd5', fg: '#9a3412' },
          expert: { bg: '#fee2e2', fg: '#991b1b' },
        },
        text: {
          primary: THEME_TEXT_PRIMARY_HEX,
          muted:   '#6B7280',
          inverse: THEME_TEXT_INVERSE_HEX,
        },
        season: {
          winter: SEASON_ACCENT_HEX.winter,
          /** Акцент весны в UI (иконки сезона и т.п.): приглушённая роза. */
          spring: SEASON_ACCENT_HEX.spring,
          summer: SEASON_ACCENT_HEX.summer,
          fall:   SEASON_ACCENT_HEX.fall,
        },
        divider: '#E5E7EB',
        /** Иконки выбора мессенджера в модалке заявки (hover / выбранное состояние). */
        messenger: {
          whatsapp: '#25D366',
          telegram: '#229ED9',
          max: '#6BAEF7',
          /** Фиолетово-синий для свечения выбранного MAX (см. `drop-shadow-messenger-max-selected`). */
          maxGlow: '#6366F1',
        },
        /**
         * Активная иконка в «Что включено» (`TourIncludedIconList`): насыщенный акцент в триаде к `seasonBg.*`.
         * Утилиты: `text-tourIncludedIcon-active-{winter|spring|summer|fall}`.
         */
        tourIncludedIcon: {
          active: {
            winter: TOUR_INCLUDED_ICON_ACTIVE_HEX.winter,
            /** Контраст к персиково-розовому `seasonBg.spring`. */
            spring: TOUR_INCLUDED_ICON_ACTIVE_HEX.spring,
            summer: TOUR_INCLUDED_ICON_ACTIVE_HEX.summer,
            fall: TOUR_INCLUDED_ICON_ACTIVE_HEX.fall,
          },
        },
        /** Тонкая линия под заголовками «О туре» / «Что включено» (см. `.tour-detail-section-heading`). */
        'tour-detail-heading-rule': 'color-mix(in srgb, #1A1A1A 11%, transparent)',
        /**
         * CTA тура (TourRequestCtaButton): насыщенный оранжевый «как апельсин» + зелёный sweep при hover/focus.
         * Начальный текст — `text.inverse` (см. `.btn-cta-tour__default` в `index.css`).
         * sweep: совпадает с `brand.primary`.
         */
        cta: {
          fill:  '#F97316',
          sweep: '#1A3C2E',
        },
        /** Кнопки «назад/вперёд» в полноэкранном просмотре фото (`TourPhotoViewer`). */
        'photo-viewer-nav':       'rgba(13, 13, 13, 0.45)',
        'photo-viewer-nav-hover': 'rgba(13, 13, 13, 0.62)',
      },
      fontFamily: {
        // Стеки — `src/constants/fonts.ts`. Nord: `font-heading` / `font-hero-carousel-phrase`; лого navbar — `font-brand-wordmark` (Dela Gothic One).
        heading:               [...fontFamilyHeadingStack],
        'brand-wordmark':      [...fontFamilyBrandWordmarkStack],
        'home-season-banner':  [...fontFamilyHomeSeasonBannerStack],
        body:                  [...fontFamilyBodyStack],
        mono:                  [...fontFamilyMonoStack],
        'hero-carousel-phrase': [...fontFamilyHeroPhraseStack],
      },
      fontSize: {
        'hero':    ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'section': ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.15' }],
        'card':    ['1.125rem', { lineHeight: '1.4' }],
        'tooltip': ['0.875rem', { lineHeight: '1.25' }],
        /** Словесное лого navbar: `text-xl` (1.25rem) +15%. */
        'brand-wordmark-nav': ['1.4375rem', { lineHeight: '2.0125rem' }],
        /** Заголовки секций «О туре» / «Что включено» на странице тура. */
        'tour-detail-section': ['1.875rem', { lineHeight: '1.25' }],
        /** Основной текст этих блоков (абзац и пункты списка). */
        'tour-detail-prose': ['1.25rem', { lineHeight: '1.6' }],
        /** Подзаголовок под заголовком тура в hero. */
        'tour-detail-hero-subtitle': ['1.125rem', { lineHeight: '1.5' }],
        /** Заголовок карточки «Программа тура» (сайдбар). */
        'tour-detail-program-heading': ['1.5rem', { lineHeight: '1.25' }],
        /** Текст шагов программы (описание этапа). */
        'tour-detail-program-body': ['1rem', { lineHeight: '1.5' }],
        /** Бейджи длительности / сложности / цены под hero. */
        'tour-detail-meta': ['1rem', { lineHeight: '1.5' }],
        /**
         * Крупный ряд под hero: от базового `tour-detail-meta` ×2, затем −35% (×0.65) ≈ 1.3rem.
         */
        'tour-detail-meta-prominent': ['1.3rem', { lineHeight: '1.5' }],
        /**
         * Цена в том же ряду: от 2× `text-xl` (1.25rem), затем −35% ≈ 1.625rem.
         */
        'tour-detail-meta-price-prominent': ['1.625rem', { lineHeight: '1.2' }],
        /** Подпись «В другой сезон» над переключателем на главной (полоса с фоном). */
        'home-season-strip-label': ['1.125rem', { lineHeight: '1.35', letterSpacing: '0.1em' }],
        /**
         * Буквы «Вкрайности» в баннере колонок (все ширины).
         * Базовый clamp ×1.4 к прежним 1.125rem / 2.4vw / 2.5rem.
         */
        'home-season-banner-letter': [
          'clamp(1.575rem, 3.36vw, 3.5rem)',
          { lineHeight: '1', letterSpacing: '0.04em' },
        ],
        /** Крупная иконка в списке «Что включено» до hover/tap (страница тура). */
        'tour-detail-included-icon-idle': ['2.25rem', { lineHeight: '1' }],
        /**
         * Активная строка: уменьшение на 15% от idle (2.25rem × 0.85), не до `text-base`.
         */
        'tour-detail-included-icon-active': ['1.9125rem', { lineHeight: '1' }],
        /** Горизонтальный ряд иконок «Что включено» (масштаб от базы 1.5rem, два шага +20%). */
        'tour-detail-included-icon-idle-horizontal': ['2.16rem', { lineHeight: '1' }],
        /** 2.16rem × 0.85 — согласовано с активным размером вертикального режима. */
        'tour-detail-included-icon-active-horizontal': ['1.836rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        /** CTA: чуть уже, чем 0.3em в референсе — читаемость длинных русских подписей. */
        cta: '0.12em',
      },
      backgroundImage: {
        /**
         * Вертикальный градиент плашки «Что включено»: сверху светлее (заголовок), снизу глубже.
         * База — `surface.light` (#F7F5F0), см. `tourIncludedColumnPanel`.
         */
        'tour-included-panel':
          'linear-gradient(180deg, color-mix(in srgb, #F7F5F0 75%, transparent) 0%, color-mix(in srgb, #F7F5F0 52%, transparent) 100%)',
        /** Фон страницы сезона: пастельный вертикальный градиент. Остановки — `SEASON_PAGE_GRADIENT_STOPS`. */
        'season-page-winter': `linear-gradient(180deg, ${SEASON_PAGE_GRADIENT_STOPS.winter.top} 0%, ${SEASON_PAGE_GRADIENT_STOPS.winter.bottom} 100%)`,
        'season-page-spring': `linear-gradient(180deg, ${SEASON_PAGE_GRADIENT_STOPS.spring.top} 0%, ${SEASON_PAGE_GRADIENT_STOPS.spring.bottom} 100%)`,
        'season-page-summer': `linear-gradient(180deg, ${SEASON_PAGE_GRADIENT_STOPS.summer.top} 0%, ${SEASON_PAGE_GRADIENT_STOPS.summer.bottom} 100%)`,
        'season-page-fall': `linear-gradient(180deg, ${SEASON_PAGE_GRADIENT_STOPS.fall.top} 0%, ${SEASON_PAGE_GRADIENT_STOPS.fall.bottom} 100%)`,
        /** Размываемый слой «мягкости» поверх `season-page-*` (см. `SeasonPageBackdrop`). */
        'season-page-atmosphere-winter': SEASON_PAGE_ATMOSPHERE.winter,
        'season-page-atmosphere-spring': SEASON_PAGE_ATMOSPHERE.spring,
        'season-page-atmosphere-summer': SEASON_PAGE_ATMOSPHERE.summer,
        'season-page-atmosphere-fall': SEASON_PAGE_ATMOSPHERE.fall,
        /** Единое «небо» главной (после hero): пастель сезона → `home-page-sky-intense.*`. */
        'home-page-sky-winter': HOME_PAGE_SKY_GRADIENT_WINTER,
        'home-page-sky-spring': HOME_PAGE_SKY_GRADIENT_SPRING,
        'home-page-sky-summer': HOME_PAGE_SKY_GRADIENT_SUMMER,
        'home-page-sky-fall': HOME_PAGE_SKY_GRADIENT_FALL,
        /**
         * Буквы «Вкрайности»: градиент под `background-clip: text` (виден только в глифах), тона от `SEASON_ACCENT_HEX.*`.
         */
        'home-season-banner-wordmark-winter': buildHomeSeasonBannerWordmarkGradient('winter'),
        'home-season-banner-wordmark-spring': buildHomeSeasonBannerWordmarkGradient('spring'),
        'home-season-banner-wordmark-summer': buildHomeSeasonBannerWordmarkGradient('summer'),
        'home-season-banner-wordmark-fall': buildHomeSeasonBannerWordmarkGradient('fall'),
        /** Текст сезона в navbar / SeasonNavDock (`SEASON_TEXT_CLASS`, `bg-clip-text`). */
        'season-chrome-text-winter': buildSeasonChromeTextGradient('winter'),
        'season-chrome-text-spring': buildSeasonChromeTextGradient('spring'),
        'season-chrome-text-summer': buildSeasonChromeTextGradient('summer'),
        'season-chrome-text-fall': buildSeasonChromeTextGradient('fall'),
        /** Полоска слева у заголовков секций тура и у блока цены. */
        'season-accent-bar-winter': buildSeasonAccentBarGradient('winter'),
        'season-accent-bar-spring': buildSeasonAccentBarGradient('spring'),
        'season-accent-bar-summer': buildSeasonAccentBarGradient('summer'),
        'season-accent-bar-fall': buildSeasonAccentBarGradient('fall'),
        /** Линия над секцией «Команда» на главной. */
        'team-section-divider-winter': buildTeamSectionDividerGradient('winter'),
        'team-section-divider-spring': buildTeamSectionDividerGradient('spring'),
        'team-section-divider-summer': buildTeamSectionDividerGradient('summer'),
        'team-section-divider-fall': buildTeamSectionDividerGradient('fall'),
      },
      backgroundSize: {
        /**
         * Буквы баннера: один горизонтальный градиент на всю сетку (10 колонок);
         * смещение столбца — `--hsb-wm-x` + keyframes `home-season-banner-wordmark-shimmer`.
         */
        'home-season-banner-wordmark-grid': '1000% 100%',
      },
      blur: {
        /** Декоративный слой сезонного фона (`SeasonPageBackdrop`). */
        'season-page-soft': '64px',
      },
      opacity: {
        /** Непрозрачность радиального слоя перед `blur-season-page-soft`. */
        'season-page-atmosphere': '0.42',
      },
      aspectRatio: {
        /** Первый ряд фотогалереи тура (широкий кадр под героем страницы). */
        'gallery-hero': '21 / 9',
        /**
         * То же поле по ширине, высота блока ≈ +30% к `gallery-hero` (21/9 ÷ 1,3).
         * Кадрирование по вертикали задаётся `object-position` (`gallery-winter-rest4`).
         */
        'gallery-hero-lifted': '359 / 200',
        /** Вертикальный акцент (первый кадр «Изюбриная» и др.) — выше широкого 21:9. */
        'gallery-portrait': '3 / 4',
        /** Баннер 10 колонок внутри `max-w-7xl`: шире колонки, умеренная высота. */
        'home-season-banner-inner': '10 / 3.25',
      },
      backgroundPosition: {
        /**
         * Фон блока «О туре» winter-3 (`gr.boarder`): якорь выше центра, чтобы в кадре оставалось лицо райдера при `bg-cover`.
         */
        'preface-winter-3-boarder': 'center 26%',
      },
      objectPosition: {
        /** Кадр `iz.rest4`: якорь обрезки при `object-cover` — верхняя часть кадра (лица). */
        'gallery-winter-rest4': '50% 43%',
        /** Галерея хаски-тур: кадр `hs.gora` (квадрат внизу сетки) — якорь при `object-cover`. */
        'gallery-winter-4-gora': 'center 73%',
        /**
         * Hero страницы тура (lg+): вертикальный якорь `calc(51% + 100px)` (база 36%+100px + 15 п.п. по вертикали).
         */
        'tour-detail-hero-desktop': 'center calc(51% + 100px)',
        /**
         * Фалаза × Грибановка (winter-3): якорь ниже центра кадра (lg+), чтобы в обрезке hero оставались люди.
         */
        'tour-detail-hero-desktop-winter-3': 'center 77%',
        /** Хаски-тур (winter-4): чуть ниже дефолтного hero, без обрезки голов (см. `tour-detail-hero-desktop`). */
        'tour-detail-hero-desktop-winter-4': 'center 58%',
      },
      spacing: {
        /** Зазор между ячейками сетки фотогалереи на странице тура. */
        'gallery-gap': '0.75rem',
        /** Между стрелками и областью кадра в `TourPhotoViewer` (десктоп). */
        'photo-viewer-nav-gap': 'clamp(0.5rem, 2vw, 1.25rem)',
        /** «Воздух» между контентом и вертикальным разделителем до сайдбара (страница тура). */
        'tour-detail-col-divider-gap': '3rem',
        /** Высота вертикального акцента у заголовка секции галереи. */
        'tour-gallery-heading-accent': '1.25rem',
        /** Ширина вертикального акцента у заголовков секций страницы тура. */
        'tour-detail-heading-accent': '0.25rem',
        /** Нижняя зона `TourDetailHero` (название, подзаголовок): вертикальный паддинг. */
        'tour-detail-hero-overlay-y': '1.25rem',
        /** Верхний отступ `tour-detail-page-inner` под hero (нижний — `tour-detail-page-inner-pb`). */
        'tour-detail-page-inner-pt': '2rem',
        'tour-detail-page-inner-pb': '3rem',
        /** Между мета-блоком и `tour-detail-preface-bg`. */
        'tour-detail-meta-to-preface': '1.5rem',
        /** Верхний паддинг контента `tour-detail-preface-bg`. */
        'tour-detail-preface-pt': '1.5rem',
        'tour-detail-preface-pt-sm': '2rem',
        /** Совпадает с `h-16` у фиксированного Navbar. */
        'navbar': '4rem',
        /** `absolute` top у h1 в `HeroCarousel`: высота navbar + бывший зазор `top-6`. */
        'home-hero-title-top': '5.5rem',
        /**
         * Home: top padding for first content in sections after hero (#tours, #team).
         * Less than `section-y` to avoid doubling vertical rhythm with the hero.
         */
        'home-section-top': '4rem',
        /** Home: margin above «В другой сезон» block at bottom of #tours (after tour grid). */
        'home-stack-gap': '2.5rem',
        /**
         * Home: top padding on the season background strip section.
         * +15% к прежним 3rem → 3.45rem.
         */
        'home-season-strip-pt': '3.45rem',
        /**
         * Home: секция «В другой сезон» — зазор под баннером, паддинг снизу полоски
         * и расстояние между подписью и кнопками (внутри одного flex-контейнера с баннером).
         * +15% к прежним 0.5rem → 0.575rem.
         */
        'home-season-banner-foot-gap': '0.575rem',
        /** От низа вьюпорта ворот до кнопки «вниз к hero» (`HomeGateScrollToHeroLink`). */
        'home-gate-scroll-hint-bottom': '1.25rem',
        /** Горизонтальные отступы круглой кнопки-стрелки ворот. */
        'home-gate-scroll-hint-pad-x': '0.875rem',
        /** Вертикальные отступы круглой кнопки-стрелки ворот. */
        'home-gate-scroll-hint-pad-y': '0.5rem',
        /** Амплитуда `keyframes.home-gate-scroll-hint-bob` (согласовано с keyframes). */
        'home-gate-scroll-hint-bob-y': '0.35rem',
        /** Между капсулой-разделителем и заголовком секции «Команда» на главной. */
        'team-section-divider-to-heading': '2rem',
        'section-y': '6rem',
        'card-p':    '1.75rem',
        'tooltip-gap': '0.375rem',
        'tooltip-x':   '0.625rem',
        'tooltip-y':   '0.375rem',
        'hero-phrase-cta-gap': '2.5rem',
        /**
         * Home hero carousel: горизонтальный паддинг подписи/CTA на узких экранах.
         * ≥ `left-4` + `w-12` кнопки навигации + небольшой зазор, чтобы текст не заходил под стрелки.
         */
        'home-hero-carousel-text-gutter-x': '4.5rem',
        /** Зазор между списком ссылок (`nav-desktop:flex`) и блоком SeasonSwitcher+CTA в Navbar. */
        'navbar-nav-to-season': 'clamp(1rem, 2vw, 2rem)',
        /** Смещение по Y для scroll-reveal (translateY). */
        'reveal-y': '1.25rem',
        /** Мин. высота строки интерактивного списка «Что включено» (~44px). */
        'tour-included-row-min-h': '2.75rem',
        /** Вертикальный зазор между пунктами списка «Что включено» (`TourIncludedIconList`). */
        'tour-included-list-gap': '1.5rem',
        /** Между горизонтальным рядом иконок и блоком текста. */
        'tour-included-horizontal-stack': '1rem',
        /**
         * Фиксированная высота слота описания под иконками «Что включено» (~3 строки `fontSize.tour-detail-prose`);
         * без CLS при переносе. Текст может визуально выходить ниже (`overflow-visible` у слота).
         */
        'tour-included-description': '6.5rem',
        /** Между кнопками-иконками в горизонтальном ряду. */
        'tour-included-icon-row-horizontal-gap': '1rem',
        /** Внутренние отступы подложки `.tour-included-icon-strip`. */
        'tour-included-icon-strip-padding': '0.75rem',
        /** Квадрат под иконку в «Что включено»: совпадает с `fontSize.tour-detail-included-icon-idle`, чтобы flex не сдвигал текст при смене размера иконки. */
        'tour-included-icon-slot': '2.25rem',
        /** Слот под иконку в горизонтальном ряду (`tour-detail-included-icon-idle-horizontal`). */
        'tour-included-icon-slot-horizontal': '2.52rem',
        /** Сдвиг иконки вправо в keyframes `tour-included-motor-*` (внутри слота). */
        'tour-included-motor-shift-x': '0.625rem',
        /** Круг хит-области у `.form-checkbox-visual` (масштаб 16px от референса 18px). */
        'form-checkbox-ripple-inset': '-0.833333rem',
        'form-checkbox-ripple-size': '2.6667rem',
        /** Keyframe `fade-up`: см. `KEYFRAME_FADE_UP_Y` в `tailwind.config.ts`. */
        'keyframe-fade-up-y': KEYFRAME_FADE_UP_Y,
        /** Keyframe `slide-in`: см. `KEYFRAME_SLIDE_IN_X` в `tailwind.config.ts`. */
        'keyframe-slide-in-x': KEYFRAME_SLIDE_IN_X,
      },
      height: {
        /** Полный вьюпорт: navbar fixed оверлеем поверх hero (`main` на главной без `pt-16`). */
        'hero-viewport': '100dvh',
        /** Круги сезона в навбаре (фикс с `season-md`, 36px). */
        'nav-season-circle-fixed': '2.25rem',
        /** Плавный масштаб 320–500px (совпадает с max у границы). */
        'nav-season-circle-fluid':
          'clamp(1.75rem, 1.75rem + (100vw - 20rem) * 0.0444, 2.25rem)',
        'nav-season-icon-fixed': '1rem',
        'nav-season-icon-fluid':
          'clamp(0.75rem, 0.75rem + (100vw - 20rem) * 0.0222, 1rem)',
        /** Иконка стрелки вниз на воротах (`HomeGateScrollToHeroLink`). */
        'home-gate-scroll-hint-icon': '1.375rem',
        /** Hero страницы тура (карусель фото + градиент под заголовок). */
        'tour-detail-hero': 'clamp(28rem, 58vh, 48rem)',
      },
      width: {
        /** Иконка стрелки вниз на воротах (`HomeGateScrollToHeroLink`). */
        'home-gate-scroll-hint-icon': '1.375rem',
        'nav-season-circle-fixed': '2.25rem',
        'nav-season-circle-fluid':
          'clamp(1.75rem, 1.75rem + (100vw - 20rem) * 0.0444, 2.25rem)',
        'nav-season-icon-fixed': '1rem',
        'nav-season-icon-fluid':
          'clamp(0.75rem, 0.75rem + (100vw - 20rem) * 0.0222, 1rem)',
      },
      maxHeight: {
        /** Панель трёх сезонов под navbar (&lt;500px); запас под wrap. */
        'season-dock-panel': '12rem',
        /** Полноэкранный просмотр фото тура (`TourPhotoViewer`, `object-contain`). */
        'photo-viewer': 'min(90dvh, 90vh)',
      },
      minWidth: {
        /** Минимальная сторона круглой кнопки «к hero» на воротах (~44px hit area). */
        'home-gate-scroll-hint-target': '2.75rem',
      },
      maxWidth: {
        /** Основная колонка страницы тура: как у сайтового контейнера (`max-w-7xl`), шире прежнего `5xl`. */
        tourDetail: '80rem',
        /** Горизонтальный разделитель над блоком «Команда» (`TeamCarousel`). */
        'team-section-divider': '28rem',
        /** Декоративный графический знак за контентом секции контактов (`ContactSection`); кап ×2 к прежнему 22rem. */
        'contact-section-mark': 'min(96vw, 44rem)',
      },
      minHeight: {
        /** Герой секции «Безопасность» на главной (фото + градиент и текст). */
        'home-safety-hero': 'clamp(17rem, 52vw, 26rem)',
        /** Минимальная высота круглой кнопки «к hero» на воротах (`min-w-home-gate-scroll-hint-target`). */
        'home-gate-scroll-hint-target': '2.75rem',
        /** Минимальная высота прямоугольника баннера внутри контейнера (md+). */
        'home-season-banner-inner': '11rem',
        /** Fallback при Suspense при смене маршрута (без CLS от «прыга» контента). */
        'route-fallback':    'clamp(16rem, 55vh, 40rem)',
        /** Полный вьюпорт ворот; navbar — оверлей (`Home`). */
        'home-gate-viewport': '100dvh',
        /**
         * Внутренний слой параллакса неба на главной: выше родителя на 15%,
         * чтобы при `translateY` не проступали края (`overflow-hidden` снаружи).
         */
        'home-sky-parallax-inner': '115%',
      },
      top: {
        /** Компенсация к `min-h-home-sky-parallax-inner` (центрирование «запаса» по вертикали). */
        'home-sky-parallax-inner': '-7.5%',
      },
      boxShadow: {
        /**
         * CTA: лёгкая тень с оттенком `colors.cta.sweep` — визуальная связка с hover-заливкой.
         * Дублирование hex намеренно (Tailwind не резолвит theme() внутри значения).
         */
        cta: '0 6px 22px color-mix(in srgb, #1A3C2E 18%, #0D0D0D 14%, transparent)',
        /**
         * Плашка «Что включено»: мягче, чем `boxShadow.cta`, чтобы блок «парил» над `seasonBg`.
         * Второй слой — акцент тени снизу (глубина без «ореола» со всех сторон).
         */
        tourIncludedPanel:
          '0 4px 18px color-mix(in srgb, #1A3C2E 10%, #0D0D0D 8%, transparent), 0 10px 26px -8px color-mix(in srgb, #0D0D0D 14%, transparent)',
        /**
         * Hover кругов `SeasonSwitcher` на главной (полоса под баннером): лёгкое свечение цветом сезона.
         * Hex синхронно с `colors.season.*`.
         */
        'season-strip-hover-winter':
          `0 0 0 1px color-mix(in srgb, ${SEASON_ACCENT_HEX.winter} 28%, transparent), 0 0 22px color-mix(in srgb, ${SEASON_ACCENT_HEX.winter} 22%, transparent)`,
        'season-strip-hover-spring':
          `0 0 0 1px color-mix(in srgb, ${SEASON_ACCENT_HEX.spring} 28%, transparent), 0 0 22px color-mix(in srgb, ${SEASON_ACCENT_HEX.spring} 22%, transparent)`,
        'season-strip-hover-summer':
          `0 0 0 1px color-mix(in srgb, ${SEASON_ACCENT_HEX.summer} 30%, transparent), 0 0 22px color-mix(in srgb, ${SEASON_ACCENT_HEX.summer} 22%, transparent)`,
        'season-strip-hover-fall':
          `0 0 0 1px color-mix(in srgb, ${SEASON_ACCENT_HEX.fall} 28%, transparent), 0 0 22px color-mix(in srgb, ${SEASON_ACCENT_HEX.fall} 22%, transparent)`,
      },
      dropShadow: {
        /**
         * Компактное свечение у выбранной иконки мессенджера (после клика), от контура иконки.
         * Цвета = `colors.messenger.*` / `messenger.maxGlow`.
         */
        'messenger-whatsapp-selected':
          '0 0 4px rgba(37, 211, 102, 0.55), 0 0 10px rgba(37, 211, 102, 0.22)',
        'messenger-telegram-selected':
          '0 0 4px rgba(34, 158, 217, 0.55), 0 0 10px rgba(34, 158, 217, 0.22)',
        'messenger-max-selected':
          '0 0 4px rgba(99, 102, 241, 0.5), 0 0 10px rgba(99, 102, 241, 0.2)',
        /**
         * Нижняя тень иконки «Что включено» при активации — оттенок согласован с фоном сезона
         * (`seasonBg.*`). Весна: оттенок розы к персиково-розовому фону.
         */
        'tour-included-hover-winter': buildTourIncludedActiveVolumeShadow('winter'),
        'tour-included-hover-spring': buildTourIncludedActiveVolumeShadow('spring'),
        'tour-included-hover-summer': buildTourIncludedActiveVolumeShadow('summer'),
        'tour-included-hover-fall': buildTourIncludedActiveVolumeShadow('fall'),
        /** Иконки сезона (navbar, переключатель, dock): блик + глубина без градиентной заливки SVG. */
        'season-chrome-icon-winter': buildSeasonChromeIconDropShadow('winter'),
        'season-chrome-icon-spring': buildSeasonChromeIconDropShadow('spring'),
        'season-chrome-icon-summer': buildSeasonChromeIconDropShadow('summer'),
        'season-chrome-icon-fall': buildSeasonChromeIconDropShadow('fall'),
        /** Читаемость букв баннера на сменяющемся видео. */
        'home-season-banner-letter':
          '0 1px 2px color-mix(in srgb, #0D0D0D 55%, transparent), 0 0 20px color-mix(in srgb, #0D0D0D 25%, transparent)',
      },
      borderRadius: {
        'card':    '1rem',
        'modal':   '1.25rem',
        'tooltip': '0.3125rem',
        /** Кнопка CTA (прямоугольная, не pill). */
        cta: '0.3125rem',
      },
      scale: {
        /** Зимние `*.banner-loop`: +20% к кадру внутри колонки (`HomeSeasonBannerColumn`, обрезка `overflow-hidden`). */
        'home-season-banner-loop': '1.2',
      },
      zIndex: {
        /** Локальный слой над z-0 внутри абсолютного стека (оверлеи под контентом). */
        'stack-base': '1',
        'navbar':      '100',
        /** Под навбаром: полоса `SeasonNavDock`. */
        'season-dock': '90',
        'tooltip':     '150',
        'modal':       '200',
        'overlay':     '199',
        /** Вспышка при смене сезона (overlay); `seasonFlash` — то же значение. */
        'season-flash': '300',
        'seasonFlash': '300',
        /** Панель бургер-меню: под строкой navbar (100), над контентом и SeasonNavDock (90). */
        mobileNav: '95',
        /** Колонки баннера «В другой сезон» под контентом `RevealBox` (z-20). */
        'home-season-banner': '15',
        /** Ворота главной: под навбаром (100) и доком сезона (90). */
        'home-gate-letterbox': '82',
        /** Секция `#home-hero`: стек над следующими секциями при наложении. */
        'home-hero': '12',
        'home-gate-glow': '83',
        'home-gate-return-veil': '84',
        /** Кнопка «к hero» на стартовом экране — над баннером (`z-home-season-banner` ниже). */
        'home-gate-scroll-hint': '25',
      },
      transitionDuration: {
        'carousel':      '600ms',
        'modal':         '300ms',
        'hover':         '200ms',
        'season-change': '600ms',
        /** Scroll-reveal: opacity + transform. */
        'reveal':        '500ms',
        /** Панель SeasonNavDock: слайд сверху вниз. */
        'season-dock-slide': '320ms',
        /** Мобильное меню навбара: выезд панели справа. */
        'mobile-nav': MOBILE_NAV_DURATION,
        /** Стрелка «к hero» на воротах: fade по скроллу; синхронно с `HOME_GATE_SCROLL_HINT_FADE_MS`. */
        'home-gate-scroll-hint-fade': HOME_GATE_SCROLL_HINT_FADE,
        /** CTA: зелёный слой `::after` (sweep). */
        'cta-sweep': CTA_SWEEP_DURATION,
        /** CTA: лёгкий scale у подписи при hover (не dual). */
        'cta-text': CTA_TEXT_SCALE_DURATION,
        /** CTA dual: шаг задержки букв относительно sweep. */
        'cta-letter-stagger': CTA_LETTER_STAGGER_MS,
        /** CTA dual: длительность появления одной буквы/иконки. */
        'cta-letter-pop': CTA_LETTER_POP_DURATION,
        /** Масштаб иконки и появление текста в «Что включено» (см. `TOUR_INCLUDED_MOTOR_DURATION_MS`). */
        'tour-included': TOUR_INCLUDED_MOTOR_DURATION,
        /** Fade подписи под рядом иконок (см. `TOUR_INCLUDED_DESCRIPTION_FADE_MS`). */
        'tour-included-description-fade': TOUR_INCLUDED_DESCRIPTION_FADE,
        /** Crossfade соседних полосок медиа (out+in одновременно); синхронно с `HOME_SEASON_BANNER_CROSSFADE_MS`. */
        'home-season-banner-crossfade': `${HOME_SEASON_BANNER_CROSSFADE_MS}ms`,
        /** Fade in полоски видео; синхронно с `HOME_SEASON_BANNER_STRIP_FADE_IN_MS`. */
        'home-season-banner-strip-in': `${HOME_SEASON_BANNER_STRIP_FADE_IN_MS}ms`,
        /** Синхронный fade-out всех букв слова; синхронно с `HOME_SEASON_BANNER_LETTER_EXIT_MS`. */
        'home-season-banner-letter-exit': `${HOME_SEASON_BANNER_LETTER_EXIT_MS}ms`,
        'home-season-banner-letter-in': `${HOME_SEASON_BANNER_LETTER_FADE_IN_MS}ms`,
        /** Navbar + SeasonNavDock: токен класса `duration-home-navbar-chrome` (на главной opacity transition отключён). */
        'home-navbar-chrome': `${HOME_NAVBAR_CHROME_TRANSITION_MS}ms`,
      },
      transitionTimingFunction: {
        'reveal-out': 'ease-out',
        /** Иконка меню (SVG stroke-dash): Material standard easing. */
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      hamburger: hamburgerTheme,
      /** SVG-чекбокс формы заявки (`FormCheckbox`): stroke и dash — как в референсе, размер бокса 16px. */
      formCheckbox: {
        strokeWidth: '1.5',
        pathDashArray: '60',
        polylineDashArray: '22',
        polylineDashOffsetIdle: '66',
        polylineDashOffsetChecked: '42',
        pathDashOffsetChecked: '60',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: `translateY(${KEYFRAME_FADE_UP_Y})` },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: `translateX(${KEYFRAME_SLIDE_IN_X})` },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bg-fade': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'season-flash': {
          '0%':   { opacity: '0' },
          '40%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'mobile-nav-backdrop': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'mobile-nav-panel': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-up-cta': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'cta-letter-pop': {
          '0%':   { opacity: '0', transform: 'translateY(0.15em)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        /**
         * «Что включено»: иконка сдвигается вправо в слоте, затем уменьшается (scale 0.85 = −15% к idle).
         * Сдвиг по X совпадает с `spacing.tour-included-motor-shift-x`.
         */
        'tour-included-motor-enter': {
          '0%': {
            transform: 'translateX(0) scale(1)',
            filter: 'brightness(0.88) saturate(1.05)',
          },
          '35%': {
            transform: 'translateX(0.625rem) scale(1)',
            filter: 'brightness(1.08) saturate(1.12)',
          },
          '100%': {
            transform: 'translateX(0.625rem) scale(0.85)',
            filter: 'brightness(1) saturate(1)',
          },
        },
        'tour-included-motor-exit': {
          '0%': {
            transform: 'translateX(0.625rem) scale(0.85)',
            filter: 'brightness(1) saturate(1)',
          },
          '40%': {
            transform: 'translateX(0.625rem) scale(1)',
            filter: 'brightness(1.08) saturate(1.12)',
          },
          '100%': {
            transform: 'translateX(0) scale(1)',
            filter: 'brightness(0.88) saturate(1.05)',
          },
        },
        'tour-included-text-enter': {
          '0%': { clipPath: 'inset(0 100% 0 0)', opacity: '0' },
          '28%': { clipPath: 'inset(0 100% 0 0)', opacity: '0' },
          '38%': { clipPath: 'inset(0 0 0 0)', opacity: '1' },
          '100%': { clipPath: 'inset(0 0 0 0)', opacity: '1' },
        },
        'tour-included-text-exit': {
          '0%': { clipPath: 'inset(0 0 0 0)', opacity: '1' },
          '32%': { clipPath: 'inset(0 100% 0 0)', opacity: '0' },
          '100%': { clipPath: 'inset(0 100% 0 0)', opacity: '0' },
        },
        'tour-meta-stagger-in': {
          '0%': {
            opacity: '0',
            transform: `translateY(${KEYFRAME_TOUR_META_STAGGER_Y})`,
          },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        /**
         * Баннер главной: снос буквы волной 9→0 — лёгкое покачивание + fade.
         * Длительность в `animation` = `HOME_SEASON_BANNER_LETTER_EXIT_MS`.
         */
        'home-season-banner-letter-wave-exit': {
          '0%': {
            opacity: '1',
            transform: 'rotate(0deg) translateY(0)',
          },
          '30%': {
            opacity: '0.82',
            transform: 'rotate(3.5deg) translateY(0.08rem)',
          },
          '65%': {
            opacity: '0.35',
            transform: 'rotate(-4deg) translateY(0.18rem)',
          },
          '100%': {
            opacity: '0',
            transform: 'rotate(1.5deg) translateY(0.28rem)',
          },
        },
        /**
         * Переливание фона в глифах: сдвиг `background-position` вдоль широкого градиента.
         * `--hsb-wm-x` задаёт столбец (0…100% по 10 колонкам); синхронно с `HOME_SEASON_BANNER_WORDMARK_SHIMMER_MS`.
         * Сдвиг ограничен `min(…, 100% − --hsb-wm-x)`: иначе у колонок с большим `--hsb-wm-x` сумма с +36%
         * уводит позицию за пределы градиента — `bg-clip-text` даёт прозрачные буквы (заметно на зиме и хвосте слова).
         */
        'home-season-banner-wordmark-shimmer': {
          '0%': { backgroundPosition: 'var(--hsb-wm-x) 50%' },
          '100%': {
            backgroundPosition:
              'calc(var(--hsb-wm-x, 0%) + min(36%, calc(100% - var(--hsb-wm-x, 0%)))) 50%',
          },
        },
        /** Стартовый экран: лёгкое покачивание стрелки «к hero» вниз. */
        'home-gate-scroll-hint-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': {
            transform: 'translateY(theme(spacing.home-gate-scroll-hint-bob-y))',
          },
        },
        /**
         * Hero: мягкая дуга к потолку (один пик, без второго «отскока» — нет конфликта с opacity-слайдами).
         * `translate3d` + полная амплитуда только в середине кривой timing на утилите анимации.
         */
        'home-hero-ceiling-bounce': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': {
            transform:
              'translate3d(0, calc(-1 * var(--home-hero-ceiling-bounce-px, 0px)), 0)',
          },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        'fade-up':  `fade-up ${FADE_UP_DURATION} ease forwards`,
        'slide-in': `slide-in ${SLIDE_IN_DURATION} ease forwards`,
        'scale-in': `scale-in ${SCALE_IN_DURATION} ease forwards`,
        'bg-fade':       'bg-fade 600ms ease forwards',
        'season-flash':  `season-flash ${SEASON_FLASH_DURATION} ease-out forwards`,
        'mobile-nav-backdrop': `mobile-nav-backdrop ${MOBILE_NAV_DURATION} ease-out forwards`,
        'mobile-nav-panel':    `mobile-nav-panel ${MOBILE_NAV_DURATION} ease-out forwards`,
        'scale-up-cta':        `scale-up-cta ${CTA_TEXT_SCALE_DURATION} ease-in-out`,
        'cta-letter-pop':      `cta-letter-pop ${CTA_LETTER_POP_DURATION} ease forwards`,
        'tour-included-motor-enter': `tour-included-motor-enter ${TOUR_INCLUDED_MOTOR_DURATION} cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        'tour-included-motor-exit': `tour-included-motor-exit ${TOUR_INCLUDED_MOTOR_DURATION} cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        'tour-included-text-enter': `tour-included-text-enter ${TOUR_INCLUDED_MOTOR_DURATION} cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        'tour-included-text-exit': `tour-included-text-exit ${TOUR_INCLUDED_MOTOR_DURATION} cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        'tour-meta-stagger-in': `tour-meta-stagger-in ${SLIDE_IN_DURATION} ease forwards`,
        'home-season-banner-letter-wave-exit': `home-season-banner-letter-wave-exit ${HOME_SEASON_BANNER_LETTER_EXIT_MS}ms ease-in-out forwards`,
        'home-season-banner-wordmark-shimmer': `home-season-banner-wordmark-shimmer ${HOME_SEASON_BANNER_WORDMARK_SHIMMER_MS}ms ease-in-out infinite alternate`,
        'home-hero-ceiling-bounce': `home-hero-ceiling-bounce ${HOME_HERO_CEILING_BOUNCE_DURATION} cubic-bezier(0.45, 0, 0.25, 1) forwards`,
        'home-gate-scroll-hint-bob': `home-gate-scroll-hint-bob ${HOME_GATE_SCROLL_HINT_BOB_DURATION} ease-in-out infinite`,
      },
      transitionDelay: {
        'tour-meta-0': '0ms',
        'tour-meta-1': '80ms',
        'tour-meta-2': '160ms',
      },
      screens: {
        /**
         * Ряд «Срок / Сложность» (`TourDetailMetaFacts`): ниже 320px — столбец, от 320px — две колонки.
         */
        'meta-min': '320px',
        xs:         '360px',  // Small Androids
        phone:      '375px',  // iPhone SE 2nd gen / mini class
        'phone-lg': '390px',  // iPhone 14 Pro / Pixel 6
        tablet:     '428px',  // iPhone Pro Max class
        /**
         * Дополняет `season-md` (min 500px): компактный dock, иконка сезона в navbar.
         * Не дублировать как `max-[499px]` — один порог задаётся здесь и в `season-md`.
         */
        'season-below-md': { max: '499px' },
        /** Подпись сезона в шапке и полный `SeasonSwitcher` в строке навбара. */
        'season-md': '500px',
        /** Ссылки Туры…Контакты, CTA в строке и бургер: ниже этого порога — мобильный режим навбара. */
        'nav-desktop': '950px',
      },
    },
  },
  plugins: [],
}

export default config
