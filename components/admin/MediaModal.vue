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
              📁 تصفح الوسائط / Browse Library
            </button>
            <button
              type="button"
              role="tab"
              class="media-tab"
              :class="{ 'media-tab--active': tab === 'upload' }"
              @click="tab = 'upload'"
            >
              ⬆️ رفع صورة محلية / Upload Local Image
            </button>
            <button
              type="button"
              role="tab"
              class="media-tab"
              :class="{ 'media-tab--active': tab === 'custom' }"
              @click="tab = 'custom'"
            >
              🔗 رابط مخصص / Custom URL
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

          <div v-else-if="tab === 'upload'" class="media-upload">
            <div class="media-pills" role="group" aria-label="Upload destination">
              <button
                v-for="dest in uploadDestinations"
                :key="dest.value"
                type="button"
                class="media-pill"
                :class="{ 'media-pill--active': uploadDestination === dest.value }"
                @click="uploadDestination = dest.value"
              >
                {{ dest.label }}
              </button>
            </div>

            <div
              class="upload-dropzone"
              :class="{ 'upload-dropzone--dragging': isDragging, 'upload-dropzone--filled': uploadFile }"
              role="button"
              tabindex="0"
              aria-label="Drop an image here or activate to browse files"
              @click="fileInputRef?.click()"
              @keydown.enter="fileInputRef?.click()"
              @keydown.space.prevent="fileInputRef?.click()"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onDrop"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="upload-native-input"
                tabindex="-1"
                aria-hidden="true"
                @change="onFileInputChange"
                @click.stop
              />
              <div v-if="uploadPreviewUrl" class="upload-preview">
                <img :src="uploadPreviewUrl" alt="Upload preview" />
              </div>
              <div v-else class="upload-drop-hint">
                <span class="upload-drop-icon" aria-hidden="true">⬆️</span>
                <span>Drag &amp; drop an image here, or click to browse…</span>
                <span class="upload-drop-sub">webp · jpg · png · gif · avif — max 8 MiB</span>
              </div>
            </div>

            <div v-if="uploadFile" class="upload-name-row">
              <label class="media-custom-label" for="upload-suggested-name">
                Suggested SEO name → {{ mediaUrlPrefixFor(uploadDestination) }}
              </label>
              <div class="upload-name-input-row">
                <input
                  id="upload-suggested-name"
                  v-model="uploadSuggestedName"
                  type="text"
                  class="media-custom-input"
                  dir="ltr"
                  spellcheck="false"
                  autocomplete="off"
                  placeholder="horse-riding-beach-agadir.webp"
                />
                <span
                  class="upload-badge"
                  :class="uploadNameValid ? 'upload-badge--ok' : 'upload-badge--warn'"
                  role="status"
                >
                  {{ uploadNameValid ? '🟢 kebab-case .webp' : '🟡 needs sanitize' }}
                </span>
              </div>
              <div class="upload-name-actions">
                <button
                  v-if="!uploadNameValid"
                  type="button"
                  class="upload-sanitize"
                  @click="sanitizeUploadName"
                >
                  Sanitize Name
                </button>
                <button type="button" class="upload-change" @click="fileInputRef?.click()">
                  Choose another file
                </button>
              </div>
            </div>

            <p v-if="uploadError" class="media-custom-error" role="alert">{{ uploadError }}</p>

            <button
              type="button"
              class="media-confirm upload-submit"
              :disabled="!uploadFile || uploading"
              @click="uploadToProject"
            >
              {{ uploading ? 'Uploading…' : '⬆️ Upload to Project' }}
            </button>
          </div>

          <div v-else class="media-custom">
            <label class="media-custom-label">Cloudinary / local URL</label>
            <input
              v-model="customUrl"
              type="text"
              class="media-custom-input"
              dir="ltr"
              placeholder="https://res.cloudinary.com/… or /images/…"
            />
            <div v-if="customUrlValid" class="media-custom-preview">
              <img :src="customUrl" alt="" loading="lazy" @error="customPreviewBroken = true" />
              <span v-if="customPreviewBroken" class="media-custom-error">
                Preview failed to load — URL format is still accepted.
              </span>
            </div>
            <span v-else-if="customUrl.trim() !== ''" class="media-custom-error">
              Only https://res.cloudinary.com/* or /images/* URLs are allowed.
            </span>
          </div>

          <div class="media-actions">
            <button type="button" class="media-cancel" @click="emit('close')">Cancel / إلغاء</button>
            <template v-if="tab !== 'upload'">
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
            </template>
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
type MediaTab = 'browse' | 'upload' | 'custom'
const tab = ref<MediaTab>('browse')
const search = ref('')
const sourceFilter = ref<'all' | 'local' | 'cloudinary'>('all')
const selected = ref<string[]>([])
const customUrl = ref('')
const customPreviewBroken = ref(false)

// ---- Upload Local Image tab ----
type UploadDestination = 'blog' | 'experiences'
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

const uploadDestinations = [
  { value: 'blog', label: 'Blog (/images/blog/)' },
  { value: 'experiences', label: 'Experiences (/images/experiences/)' },
] as const

const uploadFile = ref<File | null>(null)
const uploadPreviewUrl = ref<string | null>(null)
const uploadSuggestedName = ref('')
const uploadDestination = ref<UploadDestination>('experiences')
const isDragging = ref(false)
const uploading = ref(false)
const uploadError = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

/** Client mirror of server/utils/admin/mediaName.ts — must stay in sync. */
function sanitizeUploadBasename(raw: string): string {
  const withoutExt = raw.split('?')[0].replace(/\.[a-z0-9]+$/i, '')
  const ascii = withoutExt
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^ -~]/g, '')
    .toLowerCase()
  const kebab = ascii
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return (kebab === '' ? 'image' : kebab).slice(0, 120)
}

function suggestedNameFor(original: string): string {
  return `${sanitizeUploadBasename(original)}.webp`
}

/** 🟢 Green only when strictly lowercase kebab-case ending in `.webp`. */
const uploadNameValid = computed(() =>
  /^[a-z0-9]+(-[a-z0-9]+)*\.webp$/.test(uploadSuggestedName.value)
)

function mediaUrlPrefixFor(destination: UploadDestination): string {
  return `/images/${destination}/`
}

function revokeUploadPreview(): void {
  if (uploadPreviewUrl.value) {
    try {
      URL.revokeObjectURL(uploadPreviewUrl.value)
    } catch {
      // best effort
    }
    uploadPreviewUrl.value = null
  }
}

function pickUploadFile(file: File | undefined | null): void {
  uploadError.value = null
  if (!file) return
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Only image files are accepted (webp, jpg, png, gif, avif).'
    return
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    uploadError.value = 'Image exceeds the 8 MiB upload limit.'
    return
  }
  revokeUploadPreview()
  uploadFile.value = file
  uploadPreviewUrl.value = URL.createObjectURL(file)
  uploadSuggestedName.value = suggestedNameFor(file.name)
}

function onFileInputChange(e: Event): void {
  const input = e.target as HTMLInputElement | null
  pickUploadFile(input?.files?.[0])
  // Reset the native input so picking the same file twice still fires change.
  if (input) input.value = ''
}

function onDrop(e: DragEvent): void {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) pickUploadFile(file)
}

function sanitizeUploadName(): void {
  const seed =
    uploadSuggestedName.value.trim() !== ''
      ? uploadSuggestedName.value
      : (uploadFile.value?.name ?? 'image')
  uploadSuggestedName.value = suggestedNameFor(seed)
}

function resetUploadState(): void {
  revokeUploadPreview()
  uploadFile.value = null
  uploadSuggestedName.value = ''
  uploadDestination.value = 'experiences'
  isDragging.value = false
  uploading.value = false
  uploadError.value = null
}

async function uploadToProject(): Promise<void> {
  if (!uploadFile.value || uploading.value) return
  if (!uploadNameValid.value) sanitizeUploadName()
  uploading.value = true
  uploadError.value = null
  try {
    const form = new FormData()
    form.append('file', uploadFile.value, uploadSuggestedName.value)
    form.append('filename', uploadSuggestedName.value)
    form.append('destination', uploadDestination.value)
    const res = await $fetch<{
      success: boolean
      url?: string
      filename?: string
      error?: { message?: string }
    }>('/api/admin/upload', { method: 'POST', body: form })
    if (!res?.success || !res.url) {
      throw new Error(res?.error?.message ?? 'Upload failed.')
    }
    const url = res.url
    // Newest first so the thumbnail renders immediately in the grid.
    items.value = [{ filename: res.filename ?? url, url, isLocal: true }, ...items.value]
    resetUploadState()
    if (props.mode === 'featured') {
      // Single click-through: pass the clean path straight back to the form.
      emit('select-featured', url)
      return
    }
    if (!selected.value.includes(url)) {
      if (selected.value.length < 4) selected.value.push(url)
      else selected.value = [...selected.value.slice(1), url]
    }
    tab.value = 'browse'
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : 'Upload failed.'
  } finally {
    uploading.value = false
  }
}

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
    url.startsWith('https://res.cloudinary.com/') ||
    url.startsWith('/images/blog/') ||
    url.startsWith('/images/experiences/')
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
  // Featured mode: single click inserts the URL and closes the modal
  // (parent handles close on `select-featured`). Content mode keeps
  // multi-select for gallery building.
  if (props.mode === 'featured') {
    emit('select-featured', url)
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
  resetUploadState()
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
  revokeUploadPreview()
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

/* Upload Local Image tab */
.media-upload {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  overflow-y: auto;
  min-height: 0;
}

.upload-dropzone {
  border-radius: 14px;
  border: 2px dashed rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.upload-dropzone:hover,
.upload-dropzone:focus-visible {
  border-color: rgba(201, 168, 124, 0.6);
  outline: none;
}

.upload-dropzone--dragging {
  border-color: var(--accent);
  background: rgba(201, 168, 124, 0.1);
}

.upload-drop-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 2rem 1rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-align: center;
}

.upload-drop-icon {
  font-size: 1.6rem;
}

.upload-drop-sub {
  font-size: 0.72rem;
  opacity: 0.8;
}

.upload-native-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.upload-preview {
  padding: 0.6rem;
}

.upload-preview img {
  width: 100%;
  max-height: 240px;
  object-fit: contain;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.4);
}

.upload-name-row {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.upload-name-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.upload-name-input-row .media-custom-input {
  flex: 1 1 220px;
  min-width: 0;
}

.upload-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  border-radius: 60px;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
}

.upload-badge--ok {
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.5);
  color: #a7f3d0;
}

.upload-badge--warn {
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #fde68a;
}

.upload-name-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.upload-sanitize {
  min-height: 40px;
  padding: 0.4rem 1rem;
  border-radius: 60px;
  border: 1px solid rgba(251, 191, 36, 0.6);
  background: rgba(251, 191, 36, 0.16);
  color: #fde68a;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.upload-sanitize:hover {
  background: rgba(251, 191, 36, 0.28);
}

.upload-change {
  min-height: 40px;
  padding: 0.4rem 1rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
}

.upload-change:hover {
  color: var(--text-primary);
  border-color: rgba(201, 168, 124, 0.5);
}

.upload-submit {
  align-self: flex-end;
}

.upload-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
