<template>
  <Teleport to="body" :disabled="!isOpen">
    <Transition name="delete-modal">
      <div v-if="isOpen" class="delete-overlay" @click.self="emit('close')">
        <div
          class="delete-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm deletion"
        >
          <div class="delete-icon">🗑️</div>
          <h2 class="delete-title">حذف المقال / Delete Article</h2>
          <p class="delete-text" dir="auto">
            The article <strong>{{ title }}</strong> ({{ locale }}/{{ slug }}) will be
            moved to the server trash (<code dir="ltr">.backups/trash/</code>). This is
            reversible by an administrator with server access.
          </p>

          <label class="delete-field">
            <span class="delete-label">
              Type <code dir="ltr">DELETE</code> to confirm / اكتب DELETE للتأكيد
            </span>
            <input
              v-model="confirmation"
              type="text"
              class="delete-input"
              dir="ltr"
              placeholder="DELETE"
              autocomplete="off"
            />
          </label>

          <p v-if="errorMessage" class="delete-error">{{ errorMessage }}</p>

          <div class="delete-actions">
            <button type="button" class="delete-cancel" @click="emit('close')">
              إلغاء / Cancel
            </button>
            <button
              type="button"
              class="delete-confirm"
              :disabled="confirmation.trim() !== 'DELETE' || deleting"
              @click="confirmDelete"
            >
              {{ deleting ? 'جاري الحذف…' : 'تأكيد الحذف / Confirm Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title?: string
    locale?: string
    slug?: string
  }>(),
  {
    title: '',
    locale: '',
    slug: '',
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted'): void
}>()

const confirmation = ref('')
const deleting = ref(false)
const errorMessage = ref<string | null>(null)

async function confirmDelete(): Promise<void> {
  if (confirmation.value.trim() !== 'DELETE' || deleting.value) return
  deleting.value = true
  errorMessage.value = null
  try {
    const res = await $fetch<{ success: boolean; error?: { message?: string } }>(
      '/api/admin/delete',
      {
        method: 'POST',
        body: { locale: props.locale, slug: props.slug },
      }
    )
    if (!res?.success) {
      throw new Error(res?.error?.message || 'Delete failed.')
    }
    emit('deleted')
    emit('close')
  } catch (err: unknown) {
    const wrapped = err as { data?: { error?: { message?: string } }; message?: string }
    errorMessage.value =
      wrapped?.data?.error?.message || wrapped?.message || 'Delete failed.'
  } finally {
    deleting.value = false
  }
}

function onEscape(e: KeyboardEvent): void {
  if (e.key === 'Escape') emit('close')
}

function lockBodyScroll(lock: boolean): void {
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      confirmation.value = ''
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
.delete-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.delete-dialog {
  width: min(26rem, 100%);
  border-radius: 20px;
  border: 1px solid rgba(251, 113, 133, 0.4);
  background: rgba(13, 17, 29, 0.97);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  padding: 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  text-align: center;
}

.delete-icon {
  font-size: 2rem;
}

.delete-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.2rem;
  color: var(--text-primary);
}

.delete-text {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.delete-text code {
  font-family: ui-monospace, Consolas, monospace;
  color: var(--accent);
}

.delete-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: start;
}

.delete-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.delete-label code {
  font-family: ui-monospace, Consolas, monospace;
  color: #fecaca;
  font-weight: 700;
}

.delete-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: ui-monospace, Consolas, monospace;
}

.delete-input:focus {
  outline: none;
  border-color: #fb7185;
}

.delete-error {
  margin: 0;
  font-size: 0.82rem;
  color: #fecaca;
}

.delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.delete-cancel {
  padding: 0.55rem 1.1rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
}

.delete-confirm {
  padding: 0.55rem 1.3rem;
  border-radius: 60px;
  border: none;
  background: linear-gradient(135deg, #fb7185, #e11d48);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.delete-confirm:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.delete-modal-enter-active,
.delete-modal-leave-active {
  transition: opacity 0.25s ease;
}

.delete-modal-enter-from,
.delete-modal-leave-to {
  opacity: 0;
}
</style>
