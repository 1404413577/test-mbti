import { ref } from 'vue'
import bgmUrl from './moon-and-sun.mp3'

const isPlaying = ref(false)
let audio = null

function init() {
  if (audio) return
  audio = new Audio(bgmUrl)
  audio.loop = true
  audio.volume = 0.35
}

function play() {
  init()
  if (!audio) return
  audio.play().catch(() => {
    // 浏览器自动播放策略限制，用户需再次点击
    isPlaying.value = false
    localStorage.setItem('bg_music', 'off')
    return
  })
  isPlaying.value = true
  localStorage.setItem('bg_music', 'on')
}

function pause() {
  if (!audio) return
  audio.pause()
  isPlaying.value = false
  localStorage.setItem('bg_music', 'off')
}

function toggle() {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

function restore() {
  if (localStorage.getItem('bg_music') === 'on') {
    play()
  }
}

export function useBackgroundMusic() {
  return { isPlaying, toggle, restore }
}
