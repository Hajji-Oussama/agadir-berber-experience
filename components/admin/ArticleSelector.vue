<template>
  <div ref="rootRef" class="article-selector">
    <button type="button" class="selector-button" @click="toggle">
      <span class="selector-current">{{ currentLabel }}</span>
      <span class="selector-chevron" :class="{ 'selector-chevron--open': isOpen }">▼</span>
    </button>

    <Transition name="selector-drop">
      <div v-if="isOpen" class="selector-dropdown">
        <input
          ref="searchRef"
          v-model="query"
          type="text"
          class="selector-search"
          dir="auto"
          placeholder="Article / المقال — search title or slug…"
        />
        <div class="selector-count" dir="auto">
          عرض {{ visibleCount }} من {{ totalCount }} مقال
        </div>
        <div class="selector-list">
          <template v-for="group in filteredGroups" :key="group.locale">
            <div v-if="group.items.length > 0" class="selector-group">
              <div class="selector-group-label">{{ group.label }}</div>
              <button
                v-for="article in group.items"
                :key="`${article.locale}|||${article.slug}`"
                type="button"
                class="selector-option"
                :class="{
                  'selector-option--active':
                    article.locale === activeLocale && article.slug === activeSlug,
                }"
                @click="choose(article.locale, article.slug)"
              >
                <span class="selector-option-title" dir="auto">
                  {{ article.title || article.slug }}
                </span>
                <span class="selector-option-meta" dir="ltr">
                  {{ article.slug }} · {{ article.date }}
                </span>
              </button>
            </div>
          </template>
          <div v-if="visibleCount === 0" class="selector-empty">
            No matches. / لا توجد نتائج.
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { StudioArticleListItem, StudioLocale } from '~/composables/admin/useStudio'

const props = withDefaults(
  defineProps<{
    articles?: StudioArticleListItem[]
    activeLocale?: StudioLocale
    activeSlug?: string
    dirty?: boolean
  }>(),
  {
    articles: () => [],
    activeLocale: 'ar',
    activeSlug: '',
    dirty: false,
  }
)

const emit = defineEmits<{
  (e: 'select', locale: StudioLocale, slug: string): void
}>()

const GROUP_LABELS: Record<StudioLocale, string> = {
  ar: 'العربية (AR)',
  fr: 'Français (FR)',
  en: 'English (EN)',
}

const isOpen = ref(false)
const query = ref('')
const rootRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)

const totalCount = computed(() => (props.articles ?? []).length)

const filteredGroups = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return (['ar', 'fr', 'en'] as StudioLocale[]).map((locale) => ({
    locale,
    label: GROUP_LABELS[locale],
    items: (props.articles ?? []).filter((a) => {
      if (a.locale !== locale) return false
      if (!needle) return true
      return (
        (a.title || '').toLowerCase().includes(needle) ||
        (a.slug || '').toLowerCase().includes(needle)
      )
    }),
  }))
})

const visibleCount = computed(() =>
  filteredGroups.value.reduce((sum, group) => sum + group.items.length, 0)
)

const currentLabel = computed(() => {
  const active = (props.articles ?? []).find(
    (a) => a.locale === props.activeLocale && a.slug === props.activeSlug
  )
  return active ? active.title || active.slug : 'Select an article…'
})

function toggle(): void {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    query.value = ''
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => searchRef.value?.focus())
    }
  }
}

function close(): void {
  isOpen.value = false
}

function choose(locale: StudioLocale, slug: string): void {
  if (
    props.dirty &&
    typeof window !== 'undefined' &&
    !window.confirm('Unsaved changes will be lost. Switch article? / ستفقد التعديلات غير المحفوظة. متابعة؟')
  ) {
    return
  }
  close()
  emit('select', locale, slug)
}

function onPointerDown(e: PointerEvent): void {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    close()
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('keydown', onKeydown)
  }
})
</script>

<style scoped>
.article-selector {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 280px;
  flex: 1 1 auto;
}

@media (min-width: 1024px) {
  .article-selector {
    max-width: 340px;
  }
}

.selector-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s ease;
}

.selector-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.selector-current {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  min-width: 0;
  flex: 1 1 auto;
  text-align: start;
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .selector-current {
    max-width: 240px;
  }
}

.selector-chevron {
  font-size: 0.6rem;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.selector-chevron--open {
  transform: rotate(180deg);
}

.selector-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  inset-inline-start: 0;
  width: min(360px, 80vw);
  max-height: 320px;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: rgba(13, 17, 29, 0.97);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 50;
}

.selector-search {
  margin: 0.6rem 0.6rem 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-primary);
  font-size: 0.82rem;
}

.selector-search:focus {
  outline: none;
  border-color: var(--accent);
}

.selector-count {
  padding: 0.15rem 0.9rem 0.35rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.selector-list {
  overflow-y: auto;
  padding-bottom: 0.5rem;
}

.selector-group-label {
  padding: 0.4rem 0.9rem 0.2rem;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
}

.selector-option {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  width: 100%;
  padding: 0.5rem 0.9rem;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: start;
}

.selector-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.selector-option--active {
  background: rgba(201, 168, 124, 0.12);
}

.selector-option-title {
  color: var(--text-primary);
  font-size: 0.84rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selector-option-meta {
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-family: ui-monospace, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selector-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.selector-drop-enter-active,
.selector-drop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.selector-drop-enter-from,
.selector-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
