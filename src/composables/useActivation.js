import { ref } from 'vue'

const STORAGE_KEY = 'app_activation'
const isActivated = ref(false)
const activationCode = ref('')

// 验证激活码：16位纯码（不含横线），通过加权校验
function validateRaw(raw) {
  // 必须16位，以 "MBTI" 为前缀
  if (!/^MBTI[A-Z0-9]{12}$/.test(raw)) return false

  // 加权校验：偶数位权重7，奇数位权重13，结果 mod 97 必须等于 1
  let sum = 0
  for (let i = 0; i < raw.length; i++) {
    const w = i % 2 === 0 ? 7 : 13
    sum += raw.charCodeAt(i) * w
  }
  return sum % 97 === 1
}

// 格式化显示：CEMBTI-XXXX-XXXX-XXXX
function formatCode(raw) {
  const p = raw.slice(0, 6)
  const rest = raw.slice(6)
  const parts = [rest.slice(0, 4), rest.slice(4, 8), rest.slice(8, 12)]
  return [p, ...parts].join('-')
}

function checkStored() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (data && data.code && validateRaw(data.code)) {
      activationCode.value = formatCode(data.code)
      isActivated.value = true
      return true
    }
  } catch (_) { /* corrupt */ }
  return false
}

function activate(rawInput) {
  // 清理空格和横线
  const raw = rawInput.toUpperCase().replace(/[-\s]/g, '')
  if (!validateRaw(raw)) return false

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: raw, time: Date.now() }))
  activationCode.value = formatCode(raw)
  isActivated.value = true
  return true
}

function deactivate() {
  localStorage.removeItem(STORAGE_KEY)
  isActivated.value = false
  activationCode.value = ''
}

// 初始化时检查
checkStored()

export function useActivation() {
  return { isActivated, activationCode, activate, deactivate, checkStored }
}
