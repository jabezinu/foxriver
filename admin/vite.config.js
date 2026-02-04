import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:5002',
        target: 'https://nov-be.novis2026.net',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
