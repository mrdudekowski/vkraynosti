/// <reference types="vitest/config" />
import { realpathSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import {
  buildContentSecurityPolicy,
  parseMediaOriginFromAssetBaseUrl,
} from './src/constants/contentSecurityPolicy.ts'
import { pruneDistForCdn as pruneDistForCdnFromLib } from './scripts/lib/pruneDistForCdn.ts'
import { rewriteAdminDevUrl } from './scripts/lib/rewriteAdminDevUrl.ts'
import {
  sanitizeTimeweb404Html,
  stripGithubPagesSpaRedirectScript,
} from './scripts/lib/stripGithubPagesScripts.ts'

const projectRoot = realpathSync.native(process.cwd())
const loadedViteEnv = loadEnv(
  process.env.NODE_ENV === 'production' ? 'production' : 'development',
  projectRoot,
  'VITE_'
)
const mediaCdnOrigin = parseMediaOriginFromAssetBaseUrl(
  loadedViteEnv.VITE_PUBLIC_ASSET_BASE_URL || process.env.VITE_PUBLIC_ASSET_BASE_URL || ''
)
const cmsS3Origin = parseMediaOriginFromAssetBaseUrl(
  loadedViteEnv.VITE_CMS_S3_BASE_URL || process.env.VITE_CMS_S3_BASE_URL || ''
)
const extraCspOrigins = [mediaCdnOrigin, cmsS3Origin].filter(
  (origin): origin is string => origin != null
)
const contentSecurityPolicy = buildContentSecurityPolicy(extraCspOrigins)

function stripGithubPagesScriptForTimewebPlugin(): Plugin {
  const base = (
    loadedViteEnv.VITE_BASE_PATH ||
    process.env.VITE_BASE_PATH ||
    '/vkraynosti/'
  ).trim()
  const isTimeweb = !base || base === '/'

  return {
    name: 'strip-github-pages-spa-script',
    apply: 'build',
    transformIndexHtml(html) {
      if (!isTimeweb) {
        return html
      }
      return stripGithubPagesSpaRedirectScript(html)
    },
    async closeBundle() {
      if (!isTimeweb) return
      const filePath = path.resolve(projectRoot, 'dist', '404.html')
      try {
        const html = await fs.readFile(filePath, 'utf8')
        const sanitized = sanitizeTimeweb404Html(html, { VITE_BASE_PATH: base })
        if (sanitized !== html) {
          await fs.writeFile(filePath, sanitized, 'utf8')
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      }
    },
  }
}

function pruneDistForCdnPlugin(): Plugin {
  return {
    name: 'prune-dist-for-cdn',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(projectRoot, 'dist')
      const { pruned } = pruneDistForCdnFromLib(distDir)
      if (pruned.length > 0) {
        console.log(`[prune-dist-for-cdn] Removed from dist: ${pruned.join(', ')}`)
      }
    },
  }
}

function serveAdminHtmlPlugin(basePath: string): Plugin {
  const attach = (server: ViteDevServer) => {
    server.middlewares.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next()
        return
      }
      const original = (req as { originalUrl?: string }).originalUrl ?? req.url
      if (original == null) {
        next()
        return
      }
      const rewritten = rewriteAdminDevUrl(original, basePath)
      if (rewritten === original) {
        next()
        return
      }

      void (async () => {
        try {
          const htmlPath = path.resolve(server.config.root, 'admin/index.html')
          const html = await fs.readFile(htmlPath, 'utf8')
          const transformed = await server.transformIndexHtml('/admin/index.html', html)
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.statusCode = 200
          res.end(transformed)
        } catch (error) {
          next(error)
        }
      })()
    })
  }

  return {
    name: 'serve-admin-html',
    configureServer(server) {
      attach(server)
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

// https://vite.dev/config/
const appBasePath = (
  loadedViteEnv.VITE_BASE_PATH ||
  process.env.VITE_BASE_PATH ||
  '/vkraynosti/'
).trim()
const isTimewebAppBuild = !appBasePath || appBasePath === '/'

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  ...(isTimewebAppBuild ? {} : { 'X-Frame-Options': 'DENY' as const }),
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), clipboard-read=(), clipboard-write=()',
} as const;

export default defineConfig({
  root: projectRoot,
  plugins: [
    serveAdminHtmlPlugin(appBasePath.endsWith('/') ? appBasePath : `${appBasePath}/`),
    react(),
    injectContentSecurityPolicyPlugin(contentSecurityPolicy),
    stripGithubPagesScriptForTimewebPlugin(),
    pruneDistForCdnPlugin(),
  ],
  server: {
    headers: securityHeaders,
    proxy: {
      '/api/cms': {
        target: `http://127.0.0.1:${process.env.CMS_API_PORT || '8787'}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'scripts/**/*.test.ts', 'scripts/**/*.test.mjs'],
    exclude: [
      'scripts/cms/api/app.test.ts',
      'scripts/cms/api/**/*.integration.test.ts',
    ],
  },
  base: appBasePath.endsWith('/') ? appBasePath : `${appBasePath}/`,
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(projectRoot, 'index.html'),
        admin: path.resolve(projectRoot, 'admin.html'),
      },
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
