<template>
  <div class="activation-gate">
    <ParticleBackground />
    <div class="gate-container">
      <div class="gate-card">
        <div class="gate-header">
          <div class="gate-logo">PRO</div>
          <h1>Personality Test Center</h1>
          <p class="gate-subtitle">专业人格测评系统 · 一次激活，永久使用</p>
        </div>

        <!-- 未激活 → 输入激活码 -->
        <div v-if="!showSuccess" class="gate-form">
          <div class="input-group">
            <label>请输入激活码</label>
            <div class="code-input-wrapper">
              <input
                ref="codeInput"
                v-model="inputCode"
                @input="onInput"
                @keydown.enter="submitCode"
                placeholder="CEMBTI-XXXX-XXXX-XXXX"
                maxlength="22"
                autocomplete="off"
                :class="{ error: errorMsg }"
              />
            </div>
            <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
          </div>

          <button class="activate-btn" @click="submitCode" :disabled="!canSubmit">
            {{ submitting ? '验证中...' : '激活产品' }}
          </button>

          <p class="gate-hint">
            购买后获得激活码，输入即可永久解锁全部测评
          </p>
        </div>

        <!-- 已激活 → 进入 -->
        <div v-else class="gate-success">
          <div class="success-icon">✓</div>
          <h2>激活成功</h2>
          <p class="success-code">激活码：{{ activationCode }}</p>
          <p class="success-desc">全部 9 项专业测评已永久解锁，尽情使用。</p>
          <button class="enter-btn" @click="$emit('enter')">进入测评中心</button>
        </div>

        <!-- 底部信息 -->
        <div class="gate-footer">
          <div class="feature-row">
            <div class="feature-item">
              <span class="f-icon">🔒</span>
              <span>一次买断</span>
            </div>
            <div class="feature-item">
              <span class="f-icon">📊</span>
              <span>9项测评</span>
            </div>
            <div class="feature-item">
              <span class="f-icon">♾️</span>
              <span>永久有效</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useActivation } from '@/composables/useActivation'
import ParticleBackground from '@/components/ParticleBackground.vue'

const emit = defineEmits(['enter'])
const { isActivated, activationCode, activate } = useActivation()

const inputCode = ref('')
const errorMsg = ref('')
const showSuccess = ref(false)
const submitting = ref(false)
const codeInput = ref(null)

const canSubmit = computed(() => {
  const cleaned = inputCode.value.replace(/[-\s]/g, '')
  return cleaned.length === 16 && !submitting.value
})

const onInput = () => {
  errorMsg.value = ''
  // 自动插入横线格式化
  let val = inputCode.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (val.length > 6) val = val.slice(0, 6) + '-' + val.slice(6)
  if (val.length > 11) val = val.slice(0, 11) + '-' + val.slice(11)
  if (val.length > 16) val = val.slice(0, 16) + '-' + val.slice(16)
  if (val.length > 21) val = val.slice(0, 21)
  inputCode.value = val
  if (codeInput.value) {
    // 保持光标在末尾
    codeInput.value.setSelectionRange(val.length, val.length)
  }
}

const submitCode = () => {
  if (!canSubmit.value) return
  submitting.value = true
  errorMsg.value = ''

  // 延迟模拟验证过程，提升体验
  setTimeout(() => {
    const ok = activate(inputCode.value)
    submitting.value = false
    if (ok) {
      showSuccess.value = true
    } else {
      errorMsg.value = '激活码无效，请检查后重试'
    }
  }, 800)
}
</script>

<style scoped>
.activation-gate {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  position: relative;
}

.gate-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  padding: 2rem;
}

.gate-card {
  background: var(--color-surface);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 60px var(--color-card-shadow);
  border: 1px solid var(--color-border);
}

.gate-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.gate-logo {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 1.25rem;
}

.gate-header h1 {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text-heading);
  margin: 0 0 0.5rem;
}

.gate-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

/* 输入区域 */
.gate-form {
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.code-input-wrapper {
  position: relative;
}

.code-input-wrapper input {
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 1.15rem;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  letter-spacing: 1px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-input-bg);
  color: var(--color-text);
  text-align: center;
  transition: border-color 0.25s;
  outline: none;
}

.code-input-wrapper input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.code-input-wrapper input.error {
  border-color: var(--color-danger);
}

.error-msg {
  color: var(--color-danger);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  text-align: center;
}

.activate-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.05rem;
  font-weight: 700;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.activate-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.activate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gate-hint {
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-sub);
  margin-top: 1rem;
}

/* 成功状态 */
.gate-success {
  text-align: center;
  margin-bottom: 2rem;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-success-light);
  color: var(--color-success);
  font-size: 1.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}

.gate-success h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text-heading);
  margin: 0 0 0.75rem;
}

.success-code {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.success-desc {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.enter-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.05rem;
  font-weight: 700;
  background: var(--color-success);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  margin-top: 0.5rem;
}

.enter-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* 底部特性 */
.gate-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 1.25rem;
}

.feature-row {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.f-icon {
  font-size: 1rem;
}

@media (max-width: 480px) {
  .gate-card {
    padding: 2rem 1.5rem;
  }

  .feature-row {
    gap: 1rem;
  }
}
</style>
