import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vkraynosti/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom')) return 'vendor-react-dom';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('@fortawesome')) return 'vendor-icons';
          if (id.includes('node_modules/react/')) return 'vendor-react';
        },
      },
    },
  },
})
