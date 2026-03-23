import type { Config } from 'tailwindcss'
import {
  fontFamilyBodyStack,
  fontFamilyBrandWordmarkStack,
  fontFamilyHeadingStack,
  fontFamilyHeroPhraseStack,
  fontFamilyMonoStack,
} from './src/constants/fontFamilyStacks'

/** Длительность выезда мобильного меню (синхронно с `animation.mobile-nav-*`). */
const MOBILE_NAV_DURATION = '320ms' as const

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
      },
      spacing: {
        /** Совпадает с `h-16` у фиксированного Navbar — для `h-hero-viewport`. */
        'navbar': '4rem',
        'section-y': '6rem',
        'card-p':    '1.75rem',
        'tooltip-gap': '0.375rem',
        'tooltip-x':   '0.625rem',
        'tooltip-y':   '0.375rem',
        'hero-phrase-cta-gap': '2.5rem',
        /** Смещение по Y для scroll-reveal (translateY). */
        'reveal-y': '1.25rem',
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
      },
      minHeight: {
        'season-section':    '44rem',
        'season-section-md': '56rem',
        /** Fallback при Suspense при смене маршрута (без CLS от «прыга» контента). */
        'route-fallback':    'clamp(16rem, 55vh, 40rem)',
      },
      borderRadius: {
        'card':    '1rem',
        'modal':   '1.25rem',
        'tooltip': '0.3125rem',
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
      },
      transitionTimingFunction: {
        'reveal-out': 'ease-out',
        /** Иконка меню (SVG stroke-dash): Material standard easing. */
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
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
      },
      animation: {
        'fade-up':  'fade-up 0.72s ease forwards',
        'slide-in': 'slide-in 0.48s ease forwards',
        'scale-in': 'scale-in 0.36s ease forwards',
        'bg-fade':       'bg-fade 600ms ease forwards',
        'season-flash':  'season-flash 900ms ease-out forwards',
        'mobile-nav-backdrop': `mobile-nav-backdrop ${MOBILE_NAV_DURATION} ease-out forwards`,
        'mobile-nav-panel':    `mobile-nav-panel ${MOBILE_NAV_DURATION} ease-out forwards`,
      },
      screens: {
        xs:         '360px',  // Small Androids
        phone:      '375px',  // iPhone SE 2nd gen / mini class
        'phone-lg': '390px',  // iPhone 14 Pro / Pixel 6
        tablet:     '428px',  // iPhone Pro Max class
        /** Подпись сезона в шапке и полный `SeasonSwitcher` в строке навбара. */
        'season-md': '500px',
      },
    },
  },
  plugins: [],
}

export default config
