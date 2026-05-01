import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
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
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            if (id.includes('@element-plus/icons-vue')) {
              return 'element-icons'
            }
            if (id.includes('vue') || id.includes('vue-router') || id.includes('vue-i18n')) {
              return 'vue-vendor'
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
