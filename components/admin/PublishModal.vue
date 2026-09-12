<template>
  <Teleport to="body" :disabled="!isOpen">
    <Transition name="publish-modal">
      <div v-if="isOpen" class="publish-overlay" @click.self="onClose">
        <div
          class="publish-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Publish article"
        >
          <div class="publish-head">
            <span class="publish-title">🚀 نشر المقال / Publish Article</span>
            <button type="button" class="publish-close" aria-label="Close" @click="onClose">
              ✕
            </button>
          </div>

          <div v-if="phase === 'form'" class="publish-body">
            <p class="publish-target">
              Target file:
              <code dir="ltr">content/{{ activeLocale }}/blog/{{ activeSlug }}.md</code>
            </p>
            <p v-if="articleTitle" class="publish-article">{{ articleTitle }}</p>
            <label class="publish-field">
              <span class="publish-field-label">ملاحظة النشر (Commit Note) — optional</span>
              <input
                v-model="commitNote"
                type="text"
                class="publish-input"
                dir="auto"
                placeholder="e.g. fix prices and FAQ"
              />
            </label>
            <div class="publish-actions">
              <button type="button" class="publish-cancel" @click="onClose">
                إلغاء / Cancel
              </button>
              <button type="button" class="publish-confirm" @click="publish">
                تأكيد النشر الحي / Publish to Live
              </button>
            </div>
          </div>

          <div v-else-if="phase === 'publishing'" class="publish-body">
            <ol class="publish-steps">
              <li
                v-for="step in steps"
                :key="step.id"
                class="publish-step"
                :class="{
                  'publish-step--done': step.id < activeStep,
                  'publish-step--active': step.id === activeStep,
                }"
              >
                <span class="publish-step-dot"></span>
                {{ step.label }}
              </li>
            </ol>
          </div>

          <div v-else-if="phase === 'success'" class="publish-body publish-result">
            <div class="publish-badge">✓</div>
            <p class="publish-message">تم النشر بنجاح إلى السيرفر الحي / Published live successfully</p>
            <span class="publish-hash" dir="ltr">#{{ commitHash }}</span>
            <button type="button" class="publish-confirm" @click="onClose">
              إغلاق / Done
            </button>
          </div>

          <div v-else class="publish-body publish-result">
            <div class="publish-badge publish-badge--error">!</div>
            <p class="publish-message">{{ errorMessage || 'Publish failed.' }}</p>
            <div class="publish-actions">
              <button type="button" class="publish-cancel" @click="onClose">
                إغلاق / Close
              </button>
              <button type="button" class="publish-confirm" @click="publish">
                إعادة المحاولة / Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { StudioLocale } from '~/composables/admin/useStudio'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    activeLocale?: StudioLocale
    activeSlug?: string
    articleTitle?: string
    metadata?: Record<string, unknown>
    rawContent?: string
  }>(),
  {
    activeLocale: 'ar',
    activeSlug: '',
    articleTitle: '',
    metadata: () => ({}),
    rawContent: '',
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'published', commitHash: string): void
}>()

type Phase = 'form' | 'publishing' | 'success' | 'error'

const phase = ref<Phase>('form')
const activeStep = ref(1)
const commitNote = ref('')
const commitHash = ref('')
const errorMessage = ref<string | null>(null)

const steps = [
  { id: 1, label: 'التحقق والحفظ على القرص (Validation & Disk Save)' },
  { id: 2, label: 'تسجيل التوثيق (Git Commit)' },
  { id: 3, label: 'الرفع إلى السيرفر الرئيسي (Git Push origin main)' },
]

function onClose(): void {
  if (phase.value === 'publishing') return
  emit('close')
}

async function publish(): Promise<void> {
  phase.value = 'publishing'
  activeStep.value = 1
  errorMessage.value = null
  try {
    const res = await $fetch<{
      success: boolean
      data?: { commitHash: string }
      error?: { message?: string }
    }>('/api/admin/publish', {
      method: 'POST',
      body: {
        locale: props.activeLocale,
        slug: props.activeSlug,
        metadata: props.metadata,
        rawContent: props.rawContent,
        commitNote: commitNote.value,
      },
    })
    if (!res?.success || !res?.data?.commitHash) {
      throw new Error(res?.error?.message || 'Publish failed.')
    }
    activeStep.value = 3
    commitHash.value = res.data.commitHash
    phase.value = 'success'
    emit('published', res.data.commitHash)
  } catch (err: unknown) {
    const wrapped = err as { data?: { error?: { message?: string } }; message?: string }
    errorMessage.value =
      wrapped?.data?.error?.message || wrapped?.message || 'Publish failed.'
    phase.value = 'error'
  }
}

function onEscape(e: KeyboardEvent): void {
  if (e.key === 'Escape') onClose()
}

function lockBodyScroll(lock: boolean): void {
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      phase.value = 'form'
      activeStep.value = 1
      errorMessage.value = null
      lockBodyScroll(true)
      if (typeof window !== 'undefined') window.addEventListener('keydown', onEscape)
    } else {
      lockBodyScroll(false)
      if (typeof window !== 'undefined') window.removeEventListener('keydown', onEscape)
    }
  }
)

onBeforeUnmount(() => {
  lockBodyScroll(false)
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onEscape)
})
</script>

<style scoped>
.publish-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.publish-dialog {
  width: min(36rem, 100%);
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: rgba(13, 17, 29, 0.97);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.publish-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--glass-border);
}

.publish-title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  color: var(--text-primary);
}

.publish-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  cursor: pointer;
}

.publish-body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.25rem;
}

.publish-target {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.publish-target code {
  font-family: ui-monospace, Consolas, monospace;
  color: var(--accent);
}

.publish-article {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: var(--text-primary);
}

.publish-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.publish-field-label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.publish-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.25);
  color: var(--text-primary);
  font-size: 0.88rem;
}

.publish-input:focus {
  outline: none;
  border-color: var(--accent);
}

.publish-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
}

.publish-cancel {
  padding: 0.55rem 1.1rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
}

.publish-confirm {
  padding: 0.55rem 1.3rem;
  border-radius: 60px;
  border: none;
  background: linear-gradient(135deg, #e8c88a, #c9a87c);
  color: #000;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.publish-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.publish-step {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.publish-step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.publish-step--active {
  color: var(--text-primary);
}

.publish-step--active .publish-step-dot {
  background: #60a5fa;
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.8);
  animation: publish-pulse 1s ease-in-out infinite;
}

.publish-step--done {
  color: #a7f3d0;
}

.publish-step--done .publish-step-dot {
  background: #34d399;
}

@keyframes publish-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.publish-result {
  align-items: center;
  text-align: center;
}

.publish-badge {
  width: 56px;
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.15);
  border: 2px solid #34d399;
  color: #a7f3d0;
  font-size: 1.6rem;
  font-weight: 700;
  animation: publish-pop 0.4s ease;
}

.publish-badge--error {
  background: rgba(251, 113, 133, 0.12);
  border-color: #fb7185;
  color: #fecaca;
}

@keyframes publish-pop {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.publish-message {
  margin: 0;
  color: var(--text-primary);
}

.publish-hash {
  padding: 0.3rem 1rem;
  border-radius: 60px;
  border: 1px solid rgba(201, 168, 124, 0.5);
  background: rgba(201, 168, 124, 0.12);
  color: var(--accent);
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.9rem;
}

.publish-modal-enter-active,
.publish-modal-leave-active {
  transition: opacity 0.25s ease;
}

.publish-modal-enter-from,
.publish-modal-leave-to {
  opacity: 0;
}
</style>
