<script setup>
</script>

<template>
  <div id="app">
    <header class="lang-bar">
      <select v-model="locale" @change="onChange">
        <option value="zh-CN">中文 (简体)</option>
        <option value="en-US">English</option>
      </select>
    </header>
    <router-view />
  </div>
  
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  min-height: 100vh;
  background: #f5f7fa;
}

.lang-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
}

.lang-bar select {
  border-radius: 8px;
  padding: 6px 10px;
  border: 1px solid rgba(255,255,255,0.6);
}
</style>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'

const { locale: i18nLocale } = useI18n()
const locale = ref(i18nLocale.value)

const onChange = () => {
  setLocale(locale.value)
}

watch(i18nLocale, (v) => {
  if (locale.value !== v) locale.value = v
})
</script>
