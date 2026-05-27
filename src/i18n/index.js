import { createI18n } from 'vue-i18n'

import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

// 语言首选项：localStorage > 浏览器 > 默认 zh-CN
const getInitialLocale = () => {
  const saved = localStorage.getItem('app_locale')
  if (saved && messages[saved]) return saved
  const nav = (navigator.language || 'zh-CN').toLowerCase()
  if (messages[nav]) return nav
  // 尝试仅匹配语言前缀 (e.g., "en-GB" → "en-US", "zh-TW" → "zh-CN")
  const prefix = nav.split('-')[0]
  if (prefix === 'zh') return 'zh-CN'
  if (prefix === 'en') return 'en-US'
  // 简体中文兜底
  return 'zh-CN'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages
})

export const setLocale = (locale) => {
  if (!messages[locale]) return
  i18n.global.locale.value = locale
  localStorage.setItem('app_locale', locale)
}

export default i18n
