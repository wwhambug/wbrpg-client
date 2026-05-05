import { defineConfig } from 'vite'

export default defineConfig({
  base: '/wbrpg-client/',
  resolve: {
    alias: {
      '@scenes':    '/src/scenes',
      '@network':   '/src/network',
      '@input':     '/src/input',
      '@renderers': '/src/renderers',
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})