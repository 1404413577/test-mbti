<template>
  <div id="app">
    <!-- 未激活 → 显示激活页面 -->
    <ActivationGate v-if="!isActivated" @enter="onActivated" />

    <!-- 已激活 → 正常应用 -->
    <template v-else>
      <header class="lang-bar">
        <button class="music-toggle" @click="toggleMusic" :title="isMusicOn ? '暂停音乐' : '播放音乐'">
          {{ isMusicOn ? '🔊' : '🔇' }}
        </button>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to light' : 'Switch to dark'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <select v-model="locale" @change="onChange">
          <option value="zh-CN">中文 (简体)</option>
          <option value="en-US">English</option>
        </select>
      </header>
      <router-view />
    </template>
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

.music-toggle {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--color-text);
}

.music-toggle:hover {
  background: var(--color-surface-hover);
}
</style>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'
import { useBackgroundMusic } from '@/composables/useBackgroundMusic'
import { useActivation } from '@/composables/useActivation'
import ActivationGate from '@/components/ActivationGate.vue'

const { locale: i18nLocale } = useI18n()
const locale = ref(i18nLocale.value)
const isDark = ref(false)

const { isPlaying: isMusicOn, toggle: toggleMusic, restore: restoreMusic } = useBackgroundMusic()
const { isActivated } = useActivation()

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

const onActivated = () => {
  // 激活后路由到首页
  window.location.reload()
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
  }
  applyTheme()
  restoreMusic()
})
</script>
