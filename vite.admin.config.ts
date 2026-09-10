import path from 'node:path'
import { realpathSync } from 'node:fs'
import fs from 'node:fs/promises'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = realpathSync.native(process.cwd())
const adminPublicFiles = [
  'logo.svg',
  'admin-favicon.svg',
  'admin-favicon-32.png',
  'admin-favicon.png',
  'loginlogo.svg',
]

function normalizeAdminEntry() {
  return {
    name: 'normalize-admin-entry',
    closeBundle: async () => {
      const outputDir = path.resolve(projectRoot, 'dist-admin')
      const generatedEntry = path.join(outputDir, 'admin-app.html')
      const canonicalEntry = path.join(outputDir, 'index.html')
      try {
        await fs.access(generatedEntry)
        await fs.copyFile(generatedEntry, canonicalEntry)
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error
        await fs.access(canonicalEntry)
      }
      for (const file of adminPublicFiles) {
        await fs.copyFile(path.join(projectRoot, 'public', file), path.join(outputDir, file))
      }
    },
  }
}

export default defineConfig({
  root: projectRoot,
  base: '/',
  publicDir: false,
  plugins: [react(), normalizeAdminEntry()],
  build: {
    outDir: path.resolve(projectRoot, 'dist-admin'),
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(projectRoot, 'admin-app.html'),
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-dom')) return 'vendor-react-dom'
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('@fortawesome/free-solid-svg-icons')) return 'vendor-fa-solid'
          if (id.includes('@fortawesome')) return 'vendor-fa-core'
          if (id.includes('node_modules/react/')) return 'vendor-react'
        },
      },
    },
  },
})
