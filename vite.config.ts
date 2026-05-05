import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: '/wbrpg-client/',
  resolve: {
    alias: {
      '@scenes':    path.resolve(__dirname, 'src/scenes'),
      '@network':   path.resolve(__dirname, 'src/network'),
      '@input':     path.resolve(__dirname, 'src/input'),
      '@renderers': path.resolve(__dirname, 'src/renderers'),
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
