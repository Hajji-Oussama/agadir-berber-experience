<template>
  <Teleport to="body" :disabled="!isOpen">
    <Transition name="media-modal">
      <div v-if="isOpen" class="media-overlay" @click.self="emit('close')">
        <div
          ref="dialogRef"
          class="media-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Media library"
        >
          <div class="media-head">
            <span class="media-title">
              {{ mode === 'featured' ? 'اختيار الصورة البارزة / Featured Image' : 'مكتبة الوسائط / Media Library' }}
            </span>
            <button type="button" class="media-close" aria-label="Close" @click="emit('close')">
              ✕
            </button>
          </div>

          <div class="media-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              class="media-tab"
              :class="{ 'media-tab--active': tab === 'browse' }"
              @click="tab = 'browse'"
            >
              تصفح الوسائط / Browse Library
            </button>
            <button
              type="button"
              role="tab"
              class="media-tab"
              :class="{ 'media-tab--active': tab === 'custom' }"
              @click="tab = 'custom'"
            >
              رابط مخصص / Custom Cloudinary URL
            </button>
          </div>

          <div v-if="tab === 'browse'" class="media-browse">
            <div class="media-filters">
              <input
                v-model="search"
                type="text"
                class="media-search"
                dir="auto"
                placeholder="Search filename or URL… / بحث…"
              />
              <div class="media-pills" role="group" aria-label="Source filter">
                <button
                  v-for="pill in filterPills"
                  :key="pill.value"
                  type="button"
                  class="media-pill"
                  :class="{ 'media-pill--active': sourceFilter === pill.value }"
                  @click="sourceFilter = pill.value"
                >
                  {{ pill.label }}
                </button>
              </div>
            </div>

            <div v-if="loading" class="media-grid">
              <div v-for="n in 8" :key="n" class="media-skeleton"></div>
            </div>
            <div v-else-if="filtered.length === 0" class="media-empty">
              No media found. / لا توجد وسائط مطابقة.
            </div>
            <div v-else class="media-grid">
              <AdminMediaCard
                v-for="item in filtered"
                :key="item.url"
                :item="item"
                :is-selected="isSelected(item.url)"
                :selection-index="selectionOrder(item.url)"
                @select="onSelect(item.url)"
              />
            </div>
          </div>

          <div v-else class="media-custom">
            <label class="media-custom-label">Cloudinary / local URL</label>
            <input
              v-model="customUrl"
              type="text"
              class="media-custom-input"
              dir="ltr"
              placeholder="https://res.cloudinary.com/… or /images/blog/…"
            />
            <div v-if="customUrlValid" class="media-custom-preview">
              <img :src="customUrl" alt="" loading="lazy" @error="customPreviewBroken = true" />
              <span v-if="customPreviewBroken" class="media-custom-error">
                Preview failed to load — URL format is still accepted.
              </span>
            </div>
            <span v-else-if="customUrl.trim() !== ''" class="media-custom-error">
              Only https://res.cloudinary.com/* or /images/blog/* URLs are allowed.
            </span>
          </div>

          <div class="media-actions">
            <button type="button" class="media-cancel" @click="emit('close')">Cancel / إلغاء</button>
            <button
              v-if="mode === 'featured'"
              type="button"
              class="media-confirm"
              :disabled="effectiveSelection.length === 0"
              @click="confirmFeatured"
            >
              تعيين كصورة بارزة للمقال / Set as Featured Image
            </button>
            <button
              v-else-if="effectiveSelection.length >= 2"
              type="button"
              class="media-confirm"
              @click="confirmGallery"
            >
              إدراج كمعرض تفاعلي / Insert as Gallery (:image-gallery)
            </button>
            <button
              v-else
              type="button"
              class="media-confirm"
              :disabled="effectiveSelection.length === 0"
              @click="confirmSingle"
            >
              إدراج صورة مفردة / Insert Image
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { MediaItem } from './MediaCard.vue'

export type MediaModalMode = 'featured' | 'content'

// --snippet-start--
function buildImageMarkdown(filename: string, url: string): string {
  return `![${filename}](${url})`
}

function buildGallerySnippet(urls: string[]): string {
  return `:image-gallery{:images='[${urls.map((url) => JSON.stringify(url)).join(', ')}]'}`
}
// --snippet-end--

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    mode?: MediaModalMode
  }>(),
  {
    mode: 'content',
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-featured', url: string): void
  (e: 'insert-content', snippet: string): void
}>()

const items = ref<MediaItem[]>([])
const loading = ref(false)
const tab = ref<'browse' | 'custom'>('browse')
const search = ref('')
const sourceFilter = ref<'all' | 'local' | 'cloudinary'>('all')
const selected = ref<string[]>([])
const customUrl = ref('')
const customPreviewBroken = ref(false)

const filterPills = [
  { value: 'all', label: 'الكل / All' },
  { value: 'local', label: 'محلي / Local' },
  { value: 'cloudinary', label: 'Cloudinary' },
] as const

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return items.value.filter((item) => {
    if (sourceFilter.value === 'local' && !item.isLocal) return false
    if (sourceFilter.value === 'cloudinary' && item.isLocal) return false
    if (!query) return true
    return (
      item.filename.toLowerCase().includes(query) || item.url.toLowerCase().includes(query)
    )
  })
})

const customUrlValid = computed(() => {
  const url = customUrl.value.trim()
  return (
    url.startsWith('https://res.cloudinary.com/') || url.startsWith('/images/blog/')
  )
})

const effectiveSelection = computed(() => {
  if (tab.value === 'custom' && customUrlValid.value) return [customUrl.value.trim()]
  return [...selected.value]
})

function isSelected(url: string): boolean {
  return selected.value.includes(url)
}

function selectionOrder(url: string): number | null {
  const index = selected.value.indexOf(url)
  return index === -1 ? null : index + 1
}

function onSelect(url: string): void {
  if (props.mode === 'featured') {
    selected.value = [url]
    return
  }
  const index = selected.value.indexOf(url)
  if (index === -1) {
    if (selected.value.length >= 4) return
    selected.value.push(url)
  } else {
    selected.value.splice(index, 1)
  }
}

function filenameFor(url: string): string {
  const segment = url.split('?')[0].split('/').pop()?.trim()
  return segment && segment !== '' ? segment : 'image'
}

function confirmFeatured(): void {
  const url = effectiveSelection.value[0]
  if (!url) return
  emit('select-featured', url)
}

function confirmSingle(): void {
  const url = effectiveSelection.value[0]
  if (!url) return
  emit('insert-content', buildImageMarkdown(filenameFor(url), url))
}

function confirmGallery(): void {
  const urls = effectiveSelection.value
  if (urls.length < 2) return
  emit('insert-content', buildGallerySnippet(urls))
}

async function fetchMedia(): Promise<void> {
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; data: MediaItem[] }>('/api/admin/media')
    items.value = Array.isArray(res?.data) ? res.data : []
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

function resetState(): void {
  tab.value = 'browse'
  search.value = ''
  sourceFilter.value = 'all'
  selected.value = []
  customUrl.value = ''
  customPreviewBroken.value = false
}

function lockBodyScroll(lock: boolean): void {
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}

function onEscape(e: KeyboardEvent): void {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      resetState()
      void fetchMedia()
      lockBodyScroll(true)
      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', onEscape)
      }
    } else {
      lockBodyScroll(false)
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', onEscape)
      }
    }
  }
)

onBeforeUnmount(() => {
  lockBodyScroll(false)
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onEscape)
  }
})
</script>

<style scoped>
.media-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.media-dialog {
  width: min(880px, 100%);
  max-height: min(84vh, 760px);
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: rgba(13, 17, 29, 0.97);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.media-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--glass-border);
}

.media-title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  color: var(--text-primary);
}

.media-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  cursor: pointer;
}

.media-tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.6rem 1.25rem 0;
}

.media-tab {
  padding: 0.5rem 1rem;
  border-radius: 10px 10px 0 0;
  border: 1px solid transparent;
  border-bottom: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  cursor: pointer;
}

.media-tab--active {
  background: rgba(201, 168, 124, 0.12);
  border-color: var(--glass-border);
  color: var(--accent);
}

.media-browse {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  overflow-y: auto;
  min-height: 0;
}

.media-filters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.media-search {
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.25);
  color: var(--text-primary);
  font-size: 0.85rem;
}

.media-pills {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.media-pill {
  padding: 0.3rem 0.8rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
}

.media-pill--active {
  background: rgba(201, 168, 124, 0.18);
  border-color: rgba(201, 168, 124, 0.5);
  color: var(--accent);
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  overflow-y: auto;
  min-height: 0;
}

.media-skeleton {
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.04));
  background-size: 200% 100%;
  animation: media-shimmer 1.4s ease-in-out infinite;
}

@keyframes media-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.media-empty {
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.media-custom {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.9rem 1.25rem;
}

.media-custom-label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.media-custom-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.25);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: ui-monospace, Consolas, monospace;
}

.media-custom-preview img {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.media-custom-error {
  font-size: 0.78rem;
  color: #fecaca;
}

.media-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.9rem 1.25rem;
  border-top: 1px solid var(--glass-border);
}

.media-cancel {
  padding: 0.55rem 1.1rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
}

.media-confirm {
  padding: 0.55rem 1.3rem;
  border-radius: 60px;
  border: none;
  background: var(--accent);
  color: #000;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.media-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.media-modal-enter-active,
.media-modal-leave-active {
  transition: opacity 0.25s ease;
}

.media-modal-enter-from,
.media-modal-leave-to {
  opacity: 0;
}
</style>
