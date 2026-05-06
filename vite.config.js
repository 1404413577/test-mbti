import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // 核心魔法：如果是在 GitHub Actions 中打包，就用项目名；否则（本地/Vercel）用根路径 '/'
  base: process.env.GITHUB_ACTIONS ? '/test-mbti/' : '/',
  
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) return 'element-plus'
            if (id.includes('@element-plus/icons-vue')) return 'element-icons'
            if (id.includes('vue') || id.includes('vue-router') || id.includes('vue-i18n')) return 'vue-vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})