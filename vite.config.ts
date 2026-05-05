import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@network': resolve(__dirname, 'src/network'),
      '@input': resolve(__dirname, 'src/input'),
      '@renderers': resolve(__dirname, 'src/renderers'),
    }
  },
  server: {
    port: 5173,
    // 개발 시 서버 API 프록시 (CORS 방지)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})
