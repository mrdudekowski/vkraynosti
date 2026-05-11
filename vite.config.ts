/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://placehold.co; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://script.google.com https://script.googleusercontent.com; media-src 'self' blob:; upgrade-insecure-requests",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), clipboard-read=(), clipboard-write=()',
} as const;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  base: '/vkraynosti/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom')) return 'vendor-react-dom';
          if (id.includes('react-router')) return 'vendor-router';
          /**
           * Font Awesome: три слоя — бренды (часто только футер/контакты/модалка), solid (данные туров, UI),
           * `@fortawesome/react-fontawesome` + `fontawesome-svg-core`. Параллельная загрузка и точечный кеш.
           */
          if (id.includes('@fortawesome/free-brands-svg-icons')) return 'vendor-fa-brands';
          if (id.includes('@fortawesome/free-solid-svg-icons')) return 'vendor-fa-solid';
          if (id.includes('@fortawesome')) return 'vendor-fa-core';
          if (id.includes('node_modules/react/')) return 'vendor-react';
        },
      },
    },
  },
})
