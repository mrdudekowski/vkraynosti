/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import {
  buildContentSecurityPolicy,
  parseMediaOriginFromAssetBaseUrl,
} from './src/constants/contentSecurityPolicy.ts'
import { pruneDistForCdn as pruneDistForCdnFromLib } from './scripts/lib/pruneDistForCdn.ts'
const mediaCdnOrigin = parseMediaOriginFromAssetBaseUrl(
  process.env.VITE_PUBLIC_ASSET_BASE_URL ?? ''
)
const contentSecurityPolicy = buildContentSecurityPolicy(
  mediaCdnOrigin != null ? [mediaCdnOrigin] : []
)

function pruneDistForCdnPlugin(): Plugin {
  return {
    name: 'prune-dist-for-cdn',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist')
      const { pruned } = pruneDistForCdnFromLib(distDir)
      if (pruned.length > 0) {
        console.log(`[prune-dist-for-cdn] Removed from dist: ${pruned.join(', ')}`)
      }
    },
  }
}

function injectContentSecurityPolicyPlugin(csp: string): Plugin {
  const cspMetaPattern =
    /http-equiv="Content-Security-Policy"\s+content="[^"]*"/;

  return {
    name: 'inject-content-security-policy',
    transformIndexHtml(html) {
      if (!cspMetaPattern.test(html)) {
        return html;
      }
      return html.replace(
        cspMetaPattern,
        `http-equiv="Content-Security-Policy" content="${csp}"`
      );
    },
  };
}

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), clipboard-read=(), clipboard-write=()',
} as const;

// https://vite.dev/config/
const appBasePath = process.env.VITE_BASE_PATH?.trim() || '/vkraynosti/'

export default defineConfig({
  plugins: [
    react(),
    injectContentSecurityPolicyPlugin(contentSecurityPolicy),
    pruneDistForCdnPlugin(),
  ],
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
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'scripts/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
  base: appBasePath.endsWith('/') ? appBasePath : `${appBasePath}/`,
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
