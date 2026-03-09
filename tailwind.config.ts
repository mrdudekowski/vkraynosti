import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#1A3C2E',
          secondary: '#C8A96E',
          accent:    '#E8F4F0',
        },
        surface: {
          dark:  '#0D0D0D',
          mid:   '#1C1C1C',
          light: '#F7F5F0',
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
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Source Sans 3"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'hero':    ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'section': ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.15' }],
        'card':    ['1.125rem', { lineHeight: '1.4' }],
      },
      spacing: {
        'section-y': '6rem',
        'card-p':    '1.75rem',
      },
      borderRadius: {
        'card':  '1rem',
        'modal': '1.25rem',
      },
      zIndex: {
        'navbar':  '100',
        'modal':   '200',
        'overlay': '199',
      },
      transitionDuration: {
        'carousel': '600ms',
        'modal':    '300ms',
        'hover':    '200ms',
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
      },
      animation: {
        'fade-up':  'fade-up 0.6s ease forwards',
        'slide-in': 'slide-in 0.4s ease forwards',
        'scale-in': 'scale-in 0.3s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
