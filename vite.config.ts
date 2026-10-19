import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'node:path'

// 通过环境变量控制是否开启 API 代理（联调真实后端时使用）
const API_TARGET = process.env.API_TARGET ?? 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5178,
    proxy: {
      // 只在显式设置 API_TARGET 时启用，默认走本地 Mock
      '/tiny-shop': {
        target: API_TARGET,
        changeOrigin: true
      }
    }
  },
  build: {
    // H5 首屏体积观测
    chunkSizeWarningLimit: 800
  }
})
