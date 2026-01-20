import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:5002',
        // target: 'https://everest-db.everest12.com',
        // target: 'https://everest-bea.everest12.com',
        target: 'https://novis-be.novis2026.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
