import type { Config } from 'tailwindcss'
import {
  TOUR_INCLUDED_DESCRIPTION_FADE_MS,
  TOUR_INCLUDED_MOTOR_DURATION_MS,
} from './src/constants/tourIncludedHover'
import {
  fontFamilyBodyStack,
  fontFamilyBrandWordmarkStack,
  fontFamilyHeadingStack,
  fontFamilyHeroPhraseStack,
  fontFamilyMonoStack,
} from './src/constants/fontFamilyStacks'

/** Синхронно с `TOUR_INCLUDED_MOTOR_DURATION_MS` и `transitionDuration.tour-included`. */
const TOUR_INCLUDED_MOTOR_DURATION = `${TOUR_INCLUDED_MOTOR_DURATION_MS}ms` as const

/** Синхронно с `TOUR_INCLUDED_DESCRIPTION_FADE_MS` и fade подписи «Что включено». */
const TOUR_INCLUDED_DESCRIPTION_FADE = `${TOUR_INCLUDED_DESCRIPTION_FADE_MS}ms` as const

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
  spring: { top: '#E4F7EE', bottom: '#B2E4C8' },
  summer: { top: '#FFF5E6', bottom: '#F3DFB0' },
  fall: { top: '#FAE8DC', bottom: '#E8C4A8' },
} as const

/**
 * Радиальный «ореол» для слоя размытия (`bg-season-page-atmosphere-*` + `blur-season-page-soft`).
 * База сезона — те же hex, что у `colors.seasonBg.*`.
 */
const SEASON_PAGE_ATMOSPHERE = {
  winter:
    'radial-gradient(ellipse 115% 85% at 50% -18%, rgba(255,255,255,0.48) 0%, color-mix(in srgb, #D6E8F5 38%, transparent) 42%, transparent 72%)',
  spring:
    'radial-gradient(ellipse 115% 85% at 50% -18%, rgba(255,255,255,0.48) 0%, color-mix(in srgb, #C8EDD8 38%, transparent) 42%, transparent 72%)',
  summer:
    'radial-gradient(ellipse 115% 85% at 50% -18%, rgba(255,255,255,0.5) 0%, color-mix(in srgb, #FDEBC8 40%, transparent) 42%, transparent 72%)',
  fall:
    'radial-gradient(ellipse 115% 85% at 50% -18%, rgba(255,255,255,0.46) 0%, color-mix(in srgb, #F5D5C0 42%, transparent) 42%, transparent 72%)',
} as const

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    { pattern: /^(h|min-h|w)-nav-season-(circle|icon)-(fixed|fluid)$/, variants: ['md', 'max'] },
    { pattern: /^(h|min-h)-season-section(-md)?$/, variants: ['md'] },
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
    { pattern: /^object-tour-detail-hero-desktop(-winter-4)?$/, variants: ['lg'] },
    'object-gallery-winter-4-gora',
    'bg-preface-winter-3-boarder',
    { pattern: /^animate-tour-included-/ },
    { pattern: /^drop-shadow-tour-included-hover-/ },
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
    'blur-season-page-soft',
    'opacity-season-page-atmosphere',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#1A3C2E',
          secondary: '#C8A96E',
          accent:    '#E8F4F0',
        },
        seasonBg: {
          winter: '#D6E8F5',
          spring: '#C8EDD8',
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
        difficulty: {
          easy:   { bg: '#dcfce7', fg: '#166534' },
          medium: { bg: '#fef9c3', fg: '#854d0e' },
          hard:   { bg: '#ffedd5', fg: '#9a3412' },
          expert: { bg: '#fee2e2', fg: '#991b1b' },
        },
        text: {
          primary: '#1A1A1A',
          muted:   '#6B7280',
          inverse: '#F7F5F0',
        },
        season: {
          winter: '#7BA7BC',
          spring: '#7DBF8C',
          summer: '#E8A838',
          fall:   '#C8622A',
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
            winter: '#B45309',
            spring: '#9D174D',
            summer: '#0E7490',
            fall:   '#14532D',
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
      },
      backgroundPosition: {
        /**
         * Фон блока «О туре» winter-3 (`gr.boarder`): якорь выше центра, чтобы в кадре оставалось лицо райдера при `bg-cover`.
         */
        'preface-winter-3-boarder': 'center 26%',
      },
      objectPosition: {
        /** Кадр `iz.rest4`: якорь обрезки при `object-cover` — верхняя часть кадра (лица). */
        'gallery-winter-rest4': '50% 28%',
        /** Галерея хаски-тур: кадр `hs.gora` (квадрат внизу сетки) — якорь при `object-cover`. */
        'gallery-winter-4-gora': 'center 58%',
        /**
         * Hero страницы тура (lg+): вертикальный якорь `calc(36% + 100px)` (на 200px ниже прежнего `36% - 100px`).
         */
        'tour-detail-hero-desktop': 'center calc(36% + 100px)',
        /** Хаски-тур (winter-4): чуть ниже дефолтного hero, без обрезки голов (см. `tour-detail-hero-desktop`). */
        'tour-detail-hero-desktop-winter-4': 'center 43%',
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
        /** Совпадает с `h-16` у фиксированного Navbar — для `h-hero-viewport`. */
        'navbar': '4rem',
        /**
         * Home: top padding for first content in sections after hero (#tours, #team).
         * Less than `section-y` to avoid doubling vertical rhythm with the hero.
         */
        'home-section-top': '4rem',
        /** Home: gap between tours block and season switcher strip. */
        'home-stack-gap': '2.5rem',
        /** Home: top padding on the season background strip section. */
        'home-season-strip-pt': '3rem',
        'section-y': '6rem',
        'card-p':    '1.75rem',
        'tooltip-gap': '0.375rem',
        'tooltip-x':   '0.625rem',
        'tooltip-y':   '0.375rem',
        'hero-phrase-cta-gap': '2.5rem',
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
      // Секция «В другой сезон»: высота в 2× от базового размера (база 22rem/28rem → 44rem/56rem). Mobile-first: до md — 44rem, от md — 56rem.
      height: {
        /** Один экран под фиксированный navbar; `SeasonNavDock` — оверлей, высоту main не увеличивает. */
        'hero-viewport': 'calc(100vh - theme(spacing.navbar))',
        'season-section':    '44rem',
        'season-section-md': '56rem',
        /** Круги сезона в навбаре (фикс с `season-md`, 36px). */
        'nav-season-circle-fixed': '2.25rem',
        /** Плавный масштаб 320–500px (совпадает с max у границы). */
        'nav-season-circle-fluid':
          'clamp(1.75rem, 1.75rem + (100vw - 20rem) * 0.0444, 2.25rem)',
        'nav-season-icon-fixed': '1rem',
        'nav-season-icon-fluid':
          'clamp(0.75rem, 0.75rem + (100vw - 20rem) * 0.0222, 1rem)',
        /** Hero страницы тура (карусель фото + градиент под заголовок). */
        'tour-detail-hero': 'clamp(28rem, 58vh, 48rem)',
      },
      width: {
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
      maxWidth: {
        /** Основная колонка страницы тура: как у сайтового контейнера (`max-w-7xl`), шире прежнего `5xl`. */
        tourDetail: '80rem',
      },
      minHeight: {
        'season-section':    '44rem',
        'season-section-md': '56rem',
        /** Fallback при Suspense при смене маршрута (без CLS от «прыга» контента). */
        'route-fallback':    'clamp(16rem, 55vh, 40rem)',
        /** Область описания под горизонтальными иконками «Что включено» (стабильная высота при смене текста). */
        'tour-included-description': '5rem',
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
         * (`seasonBg.*`). Весна: контраст к мятному фону (`seasonBg.spring` + `brand.primary`).
         */
        'tour-included-hover-winter':
          '0 5px 10px color-mix(in srgb, #1A1A1A 22%, #7BA7BC 16%, transparent)',
        'tour-included-hover-spring':
          '0 5px 12px color-mix(in srgb, #1A3C2E 38%, #0D0D0D 14%, transparent)',
        'tour-included-hover-summer':
          '0 5px 10px color-mix(in srgb, #1A1A1A 20%, #E8A838 18%, transparent)',
        'tour-included-hover-fall':
          '0 5px 10px color-mix(in srgb, #1A1A1A 24%, #C8622A 14%, transparent)',
      },
      borderRadius: {
        'card':    '1rem',
        'modal':   '1.25rem',
        'tooltip': '0.3125rem',
        /** Кнопка CTA (прямоугольная, не pill). */
        cta: '0.3125rem',
      },
      zIndex: {
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
