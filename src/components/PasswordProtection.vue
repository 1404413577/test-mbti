<template>
  <div v-if="!isVerified" class="password-overlay">
    <div class="password-container">
      <div class="password-card">
        <div class="password-header">
          <div class="lock-icon">🔒</div>
          <h2>{{ $t('password.title') }}</h2>
          <p class="password-hint">{{ $t('password.hint') }}</p>
        </div>
        
        <div class="password-input-group">
          <input 
            v-model="passwordInput"
            type="password"
            :placeholder="$t('password.placeholder')"
            @keyup.enter="verifyPassword"
            class="password-input"
            :class="{ error: passwordError }"
            autofocus
          />
          <div v-if="passwordError" class="error-message">
            {{ passwordErrorMessage }}
          </div>
        </div>
        
        <button @click="verifyPassword" class="verify-btn">
          {{ $t('password.verify') }}
        </button>
      </div>
    </div>
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  moduleKey: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['verified'])

const isVerified = ref(false)
const passwordInput = ref('')
const passwordError = ref(false)
const passwordErrorMessage = ref('')

// 生成今天的密码
const generateTodayPassword = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `ceshi${year}${month}${day}`
}

// 验证密码
const verifyPassword = () => {
  const correctPassword = generateTodayPassword()
  
  if (passwordInput.value.trim() === '') {
    passwordError.value = true
    passwordErrorMessage.value = '请输入密码'
    return
  }
  
  if (passwordInput.value === correctPassword) {
    passwordError.value = false
    passwordErrorMessage.value = ''
    // 验证成功，保存到 sessionStorage
    sessionStorage.setItem(`password_verified_${props.moduleKey}`, 'true')
    isVerified.value = true
    emit('verified')
  } else {
    passwordError.value = true
    passwordErrorMessage.value = '密码错误，请检查日期是否正确'
    // 清空输入框
    passwordInput.value = ''
  }
}

// 检查是否已验证密码
const checkPasswordVerification = () => {
  const verified = sessionStorage.getItem(`password_verified_${props.moduleKey}`)
  if (verified === 'true') {
    isVerified.value = true
    return true
  }
  return false
}

onMounted(() => {
  if (checkPasswordVerification()) {
    emit('verified')
  }
})
</script>

<style scoped>
/* 密码验证遮罩层 */
.password-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.password-container {
  padding: 2rem;
  width: 100%;
  max-width: 500px;
}

.password-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: slideUp 0.4s ease;
}

.password-header {
  margin-bottom: 2rem;
}

.lock-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.2));
}

.password-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.8rem;
  font-weight: 700;
  color: #1e293b;
}

.password-hint {
  font-size: 0.95rem;
  color: #64748b;
  margin-top: 0.5rem;
  line-height: 1.6;
}

.password-input-group {
  margin-bottom: 1.5rem;
}

.password-input {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.password-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.password-input.error {
  border-color: #ef4444;
  animation: shake 0.5s;
}

.password-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: left;
  padding-left: 0.5rem;
}

.verify-btn {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: #409eff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.verify-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.verify-btn:active {
  transform: translateY(0);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .password-container {
    padding: 1rem;
  }
  
  .password-card {
    padding: 2rem 1.5rem;
  }
  
  .lock-icon {
    font-size: 3rem;
  }
  
  .password-header h2 {
    font-size: 1.5rem;
  }
}
</style>
