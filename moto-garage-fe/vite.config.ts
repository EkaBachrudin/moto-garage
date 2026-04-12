import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand']
  },
  server: {
    host: true, // Listen on all addresses for Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Required for hot-reload in Docker
    },
  },
})
