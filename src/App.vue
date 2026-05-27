<template>
  <div id="app">
    <header class="lang-bar">
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to light' : 'Switch to dark'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
      <select v-model="locale" @change="onChange">
        <option value="zh-CN">中文 (简体)</option>
        <option value="en-US">English</option>
      </select>
    </header>
    <router-view />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  background: var(--color-bg);
}

.lang-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-nav-bg);
  backdrop-filter: blur(6px);
}

.lang-bar select {
  border-radius: 8px;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  background: var(--color-input-bg);
  color: var(--color-text);
}
</style>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'

const { locale: i18nLocale } = useI18n()
const locale = ref(i18nLocale.value)
const isDark = ref(false)

const onChange = () => {
  setLocale(locale.value)
}

watch(i18nLocale, (v) => {
  if (locale.value !== v) locale.value = v
})

const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
  }
  applyTheme()
})
</script>
