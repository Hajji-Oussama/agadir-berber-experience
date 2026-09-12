<template>
  <Teleport to="body" :disabled="!isOpen">
    <Transition name="new-article-modal">
      <div v-if="isOpen" class="new-article-overlay" @click.self="emit('close')">
        <div
          class="new-article-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="New article"
        >
          <div class="new-article-head">
            <span class="new-article-title">➕ مقال جديد / New Article</span>
            <button type="button" class="new-article-close" aria-label="Close" @click="emit('close')">
              ✕
            </button>
          </div>

          <div class="new-article-body">
            <div class="new-article-locales" role="radiogroup" aria-label="Locale">
              <button
                v-for="option in localeOptions"
                :key="option.code"
                type="button"
                role="radio"
                class="locale-pill"
                :class="{ 'locale-pill--active': localeDraft === option.code }"
                :aria-checked="localeDraft === option.code"
                @click="localeDraft = option.code"
              >
                {{ option.label }}
              </button>
            </div>

            <label class="new-article-field">
              <span class="new-article-label">Title / العنوان</span>
              <input
                v-model="titleDraft"
                type="text"
                class="new-article-input"
                dir="auto"
                placeholder="Article title…"
                @input="onTitleInput"
              />
            </label>

            <div class="new-article-field">
              <span class="new-article-label">Slug / المعرف</span>
              <div class="new-article-slug-row">
                <input
                  v-model="slugDraft"
                  type="text"
                  class="new-article-input new-article-input--slug"
                  dir="ltr"
                  :disabled="!manualSlug"
                  placeholder="my-article-slug"
                />
                <button
                  type="button"
                  class="new-article-override"
                  :class="{ 'new-article-override--on': manualSlug }"
                  :title="manualSlug ? 'Auto-generate from title' : 'Edit slug manually'"
                  @click="manualSlug = !manualSlug"
                >
                  {{ manualSlug ? '🔓' : '🔒' }}
                </button>
              </div>
              <span v-if="slugDraft && !slugValid" class="new-article-error">
                Slug must be lowercase alphanumeric with hyphens only.
              </span>
              <span class="new-article-preview" dir="ltr">
                /{{ localeDraft }}/blog/{{ slugDraft || '…' }}
              </span>
            </div>

            <div class="new-article-actions">
              <button type="button" class="new-article-cancel" @click="emit('close')">
                إلغاء / Cancel
              </button>
              <button
                type="button"
                class="new-article-confirm"
                :disabled="!canCreate"
                @click="create"
              >
                إنشاء المسودة / Create Draft
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
    initialLocale?: StudioLocale
  }>(),
  {
    initialLocale: 'ar',
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', payload: { locale: StudioLocale; title: string; slug: string }): void
}>()

const localeOptions: { code: StudioLocale; label: string }[] = [
  { code: 'ar', label: 'العربية (ar)' },
  { code: 'fr', label: 'Français (fr)' },
  { code: 'en', label: 'English (en)' },
]

const localeDraft = ref<StudioLocale>(props.initialLocale)
const titleDraft = ref('')
const slugDraft = ref('')
const manualSlug = ref(false)

const slugValid = computed(() => /^[a-z0-9-]+$/.test(slugDraft.value))
const canCreate = computed(
  () => titleDraft.value.trim() !== '' && slugValid.value
)

function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function onTitleInput(): void {
  if (!manualSlug.value) {
    const auto = slugify(titleDraft.value)
    if (auto) slugDraft.value = auto
  }
}

function create(): void {
  if (!canCreate.value) return
  emit('create', {
    locale: localeDraft.value,
    title: titleDraft.value.trim(),
    slug: slugDraft.value,
  })
  emit('close')
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
      localeDraft.value = props.initialLocale
      titleDraft.value = ''
      slugDraft.value = ''
      manualSlug.value = false
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
.new-article-overlay {
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

.new-article-dialog {
  width: min(28rem, 100%);
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: rgba(13, 17, 29, 0.97);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.new-article-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--glass-border);
}

.new-article-title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  color: var(--text-primary);
}

.new-article-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  cursor: pointer;
}

.new-article-body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.25rem;
}

.new-article-locales {
  display: flex;
  gap: 0.4rem;
}

.locale-pill {
  flex: 1 1 0;
  padding: 0.5rem 0.4rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
}

.locale-pill--active {
  background: rgba(201, 168, 124, 0.18);
  border-color: rgba(201, 168, 124, 0.55);
  color: var(--accent);
  font-weight: 600;
}

.new-article-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.new-article-label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.new-article-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.25);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.new-article-input:focus {
  outline: none;
  border-color: var(--accent);
}

.new-article-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.new-article-input--slug {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.82rem;
}

.new-article-slug-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.new-article-slug-row .new-article-input {
  flex: 1 1 auto;
  min-width: 0;
}

.new-article-override {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  font-size: 1rem;
  cursor: pointer;
}

.new-article-override--on {
  border-color: rgba(201, 168, 124, 0.55);
}

.new-article-error {
  font-size: 0.75rem;
  color: #fecaca;
}

.new-article-preview {
  font-size: 0.75rem;
  color: var(--accent);
  font-family: ui-monospace, Consolas, monospace;
}

.new-article-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
}

.new-article-cancel {
  padding: 0.55rem 1.1rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
}

.new-article-confirm {
  padding: 0.55rem 1.3rem;
  border-radius: 60px;
  border: none;
  background: var(--accent);
  color: #000;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.new-article-confirm:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.new-article-modal-enter-active,
.new-article-modal-leave-active {
  transition: opacity 0.25s ease;
}

.new-article-modal-enter-from,
.new-article-modal-leave-to {
  opacity: 0;
}
</style>
