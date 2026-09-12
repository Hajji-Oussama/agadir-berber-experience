<template>
  <Transition name="lock-screen" appear>
    <div class="lock-screen">
      <form class="lock-card" @submit.prevent="submit">
        <div class="lock-icon">🔐</div>
        <h1 class="lock-title">CMS Studio</h1>
        <p class="lock-subtitle">Agadir Berbère Expérience — restricted area</p>

        <label class="lock-field">
          <span class="lock-label">كلمة المرور / Password</span>
          <div class="lock-input-row">
            <input
              ref="passwordRef"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="lock-input"
              dir="auto"
              autocomplete="current-password"
              :disabled="loading"
            />
            <button
              type="button"
              class="lock-visibility"
              :title="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </label>

        <p v-if="errorMessage" class="lock-error">{{ errorMessage }}</p>

        <button type="submit" class="lock-submit" :disabled="loading || password === ''">
          <span v-if="loading" class="lock-spinner" aria-hidden="true"></span>
          {{ loading ? 'جاري التحقق…' : 'دخول / Unlock' }}
        </button>
      </form>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// Rendered exclusively by the parent (`v-else-if="!isAuthenticated"`), so no
// visibility prop is needed: mounted means locked.
const emit = defineEmits<{
  (e: 'authenticated'): void
}>()

const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const passwordRef = ref<HTMLInputElement | null>(null)
let shakeTimer: ReturnType<typeof setTimeout> | null = null

function focusPassword(): void {
  if (typeof window === 'undefined') return
  window.requestAnimationFrame(() => passwordRef.value?.focus())
}

async function submit(): Promise<void> {
  if (loading.value || password.value === '') return
  loading.value = true
  errorMessage.value = null
  try {
    await $fetch('/api/admin/auth/login', {
      method: 'POST',
      body: { password: password.value },
    })
    password.value = ''
    emit('authenticated')
  } catch (err: unknown) {
    const wrapped = err as { data?: { error?: { message?: string } }; message?: string }
    errorMessage.value =
      wrapped?.data?.error?.message || wrapped?.message || 'Authentication failed.'
    if (shakeTimer) clearTimeout(shakeTimer)
    shakeTimer = setTimeout(() => focusPassword(), 350)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  focusPassword()
})

onBeforeUnmount(() => {
  if (shakeTimer) clearTimeout(shakeTimer)
})
</script>

<style scoped>
.lock-screen {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
}

.lock-card {
  width: min(22rem, 100%);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 2rem 1.75rem;
  border-radius: 24px;
  border: 1px solid rgba(201, 168, 124, 0.45);
  background: rgba(13, 17, 29, 0.9);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  text-align: center;
}

.lock-error {
  animation: lock-shake 0.35s ease;
}

.lock-icon {
  font-size: 2.2rem;
}

.lock-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--accent);
}

.lock-subtitle {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.lock-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: start;
}

.lock-label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.lock-input-row {
  display: flex;
  gap: 0.5rem;
}

.lock-input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-primary);
  font-size: 1rem;
}

.lock-input:focus {
  outline: none;
  border-color: var(--accent);
}

.lock-visibility {
  flex-shrink: 0;
  width: 44px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  font-size: 1.05rem;
  cursor: pointer;
}

.lock-error {
  margin: 0;
  font-size: 0.82rem;
  color: #fecaca;
}

.lock-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.7rem;
  border-radius: 60px;
  border: none;
  background: linear-gradient(135deg, #e8c88a, #c9a87c);
  color: #000;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.lock-submit:disabled {
  opacity: 0.55;
  cursor: wait;
}

.lock-spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.25);
  border-top-color: #000;
  animation: lock-spin 0.8s linear infinite;
}

@keyframes lock-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes lock-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-7px);
  }
  75% {
    transform: translateX(7px);
  }
}

.lock-screen-enter-active,
.lock-screen-leave-active {
  transition: opacity 0.35s ease;
}

.lock-screen-enter-from,
.lock-screen-leave-to {
  opacity: 0;
}
</style>
