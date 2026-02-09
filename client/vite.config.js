import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate unique hashes for all assets to bust cache
    rollupOptions: {
      output: {
        // Add timestamp to filenames for cache busting
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:5002',
        target: 'https://backend-novis.novis2026.cloud',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
