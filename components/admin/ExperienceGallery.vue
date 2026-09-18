<template>
  <div class="gallery-manager">
    <div class="gallery-head">
      <span class="fm-field-label">Gallery — {{ items.length }} image{{ items.length === 1 ? '' : 's' }}</span>
      <button
        type="button"
        class="gallery-add-toggle"
        :aria-expanded="isPickerOpen"
        aria-controls="gallery-picker"
        @click="togglePicker"
      >
        <AdminIcon name="plus" :size="16" />
        <span>{{ isPickerOpen ? 'Close picker' : 'Add image' }}</span>
      </button>
    </div>

    <!-- Visual thumbnails grid -->
    <div v-if="items.length > 0" class="gallery-grid" role="list" aria-label="Gallery images">
      <div
        v-for="(url, index) in items"
        :key="`${index}-${url}`"
        class="gallery-thumb"
        role="listitem"
      >
        <button
          type="button"
          class="gallery-thumb-btn"
          :aria-label="`Expand gallery image ${index + 1} of ${items.length}`"
          @click="openLightbox(index, $event)"
        >
          <img :src="url" :alt="`Gallery image ${index + 1}`" loading="lazy" width="160" height="120" />
        </button>
        <span class="gallery-index" aria-hidden="true">{{ index + 1 }}</span>
        <div class="gallery-thumb-actions" role="group" :aria-label="`Actions for image ${index + 1}`">
          <button
            type="button"
            class="gallery-mini-btn"
            :disabled="index === 0"
            :aria-label="`Move image ${index + 1} left`"
            title="Move left"
            @click="move(index, -1)"
          >
            <AdminIcon name="arrow-left" :size="15" />
          </button>
          <button
            type="button"
            class="gallery-mini-btn"
            :disabled="index === items.length - 1"
            :aria-label="`Move image ${index + 1} right`"
            title="Move right"
            @click="move(index, 1)"
          >
            <AdminIcon name="arrow-right" :size="15" />
          </button>
          <button
            type="button"
            class="gallery-mini-btn gallery-mini-btn--danger"
            :aria-label="`Delete gallery image ${index + 1}`"
            title="Delete"
            @click="remove(index)"
          >
            <AdminIcon name="trash" :size="15" />
          </button>
        </div>
      </div>
    </div>
    <p v-else class="gallery-empty">
      No gallery images yet. Open the picker to add assets or paste a URL.
    </p>

    <!-- Asset picker -->
    <div v-if="isPickerOpen" id="gallery-picker" class="gallery-picker">
      <div class="gallery-picker-row">
        <label class="visually-hidden" for="gallery-picker-search">Search media assets</label>
        <input
          id="gallery-picker-search"
          v-model="pickerSearch"
          type="search"
          class="fm-input"
          dir="auto"
          placeholder="Search assets…"
          autocomplete="off"
        />
        <button type="button" class="gallery-refresh" aria-label="Reload media assets" title="Reload" @click="loadMedia">
          <AdminIcon name="refresh" :size="16" :class="{ 'is-spinning': pickerLoading }" />
        </button>
      </div>

      <!-- Native upload: drag-and-drop + file input, sanitized to kebab-case .webp -->
      <div
        class="gallery-upload"
        :class="{ 'gallery-upload--dragging': isUploadDragging }"
        @dragover.prevent="isUploadDragging = true"
        @dragleave.prevent="isUploadDragging = false"
        @drop.prevent="onUploadDrop"
      >
        <div class="gallery-upload-row">
          <label class="gallery-upload-btn" for="gallery-upload-input">
            <AdminIcon name="plus" :size="14" />
            <span>{{ uploadFile ? 'Change file' : 'Upload local image' }}</span>
          </label>
          <input
            id="gallery-upload-input"
            type="file"
            accept="image/*"
            class="visually-hidden"
            @change="onUploadFileChange"
          />
          <div class="gallery-upload-dests" role="group" aria-label="Upload destination">
            <button
              type="button"
              class="gallery-dest"
              :class="{ 'gallery-dest--active': uploadDestination === 'experiences' }"
              @click="uploadDestination = 'experiences'"
            >
              Experiences
            </button>
            <button
              type="button"
              class="gallery-dest"
              :class="{ 'gallery-dest--active': uploadDestination === 'blog' }"
              @click="uploadDestination = 'blog'"
            >
              Blog
            </button>
          </div>
        </div>
        <div v-if="uploadFile" class="gallery-upload-detail">
          <img
            v-if="uploadPreviewUrl"
            :src="uploadPreviewUrl"
            alt="Upload preview"
            class="gallery-upload-preview"
          />
          <div class="gallery-upload-meta">
            <input
              v-model="uploadName"
              type="text"
              class="fm-input fm-input--slug"
              dir="ltr"
              spellcheck="false"
              autocomplete="off"
              placeholder="horse-riding-beach-agadir.webp"
              aria-label="Suggested SEO filename"
            />
            <span
              class="gallery-upload-badge"
              :class="uploadNameValid ? 'gallery-upload-badge--ok' : 'gallery-upload-badge--warn'"
              role="status"
            >
              {{ uploadNameValid ? '🟢 kebab-case .webp' : '🟡 needs sanitize' }}
            </span>
            <div class="gallery-upload-actions">
              <button
                v-if="!uploadNameValid"
                type="button"
                class="gallery-sanitize"
                @click="sanitizeUploadName"
              >
                Sanitize Name
              </button>
              <button
                type="button"
                class="gallery-add-url"
                :disabled="uploading"
                @click="uploadToGallery"
              >
                {{ uploading ? 'Uploading…' : 'Upload & Add to Gallery' }}
              </button>
            </div>
          </div>
        </div>
        <p v-if="uploadError" class="gallery-manual-error" role="alert">{{ uploadError }}</p>
      </div>

      <div v-if="pickerLoading" class="gallery-picker-loading" aria-busy="true">Loading assets…</div>
      <div v-else-if="pickerError" class="gallery-picker-error" role="alert">
        {{ pickerError }}
      </div>
      <div v-else-if="filteredMedia.length === 0" class="gallery-picker-empty">
        No matching assets.
      </div>
      <ul v-else class="gallery-picker-list">
        <li v-for="asset in filteredMedia.slice(0, 60)" :key="asset.url">
          <button
            type="button"
            class="gallery-asset"
            :disabled="items.includes(asset.url)"
            :aria-label="items.includes(asset.url) ? `Already in gallery: ${asset.filename}` : `Add ${asset.filename} to gallery`"
            :title="asset.url"
            @click="add(asset.url)"
          >
            <img :src="asset.url" alt="" loading="lazy" width="72" height="54" aria-hidden="true" />
            <span class="gallery-asset-check" aria-hidden="true">
              <AdminIcon :name="items.includes(asset.url) ? 'check' : 'plus'" :size="14" />
            </span>
          </button>
        </li>
      </ul>

      <form class="gallery-url-row" @submit.prevent="addManual">
        <label class="visually-hidden" for="gallery-manual-url">Add image by URL</label>
        <input
          id="gallery-manual-url"
          v-model="manualUrl"
          type="url"
          class="fm-input fm-input--slug"
          dir="ltr"
          placeholder="https://… or /images/experiences/…"
          autocomplete="off"
        />
        <button type="submit" class="gallery-add-url">Add URL</button>
      </form>
      <p v-if="manualError" class="gallery-manual-error" role="alert">{{ manualError }}</p>
    </div>

    <!-- Glass lightbox -->
    <Teleport to="body">
      <Transition name="gallery-lightbox">
        <div
          v-if="lightboxIndex !== null"
          class="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image viewer"
          @click.self="closeLightbox"
          @keydown="onLightboxKeydown"
        >
          <div class="gallery-lightbox-card">
            <div class="gallery-lightbox-bar">
              <span class="gallery-lightbox-count" aria-live="polite">
                {{ (lightboxIndex ?? 0) + 1 }} / {{ items.length }}
              </span>
              <button ref="lightboxCloseRef" type="button" class="gallery-lightbox-btn" aria-label="Close viewer" @click="closeLightbox">
                <AdminIcon name="x" :size="18" />
              </button>
            </div>
            <img
              v-if="lightboxIndex !== null && items[lightboxIndex]"
              :src="items[lightboxIndex]"
              :alt="`Gallery image ${(lightboxIndex ?? 0) + 1}`"
              class="gallery-lightbox-img"
            />
            <div class="gallery-lightbox-nav">
              <button type="button" class="gallery-lightbox-btn" aria-label="Previous image" @click="stepLightbox(-1)">
                <AdminIcon name="arrow-left" :size="18" />
              </button>
              <button type="button" class="gallery-lightbox-btn" aria-label="Next image" @click="stepLightbox(1)">
                <AdminIcon name="arrow-right" :size="18" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string[]
  }>(),
  { modelValue: () => [] }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const items = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

const isPickerOpen = ref(false)
const pickerSearch = ref('')
const pickerLoading = ref(false)
const pickerError = ref<string | null>(null)
const pickerLoaded = ref(false)
const mediaItems = ref<{ filename: string; url: string; isLocal: boolean }[]>([])
const manualUrl = ref('')
const manualError = ref<string | null>(null)

const lightboxIndex = ref<number | null>(null)
const lightboxCloseRef = ref<HTMLButtonElement | null>(null)
let lastFocusedThumb: HTMLElement | null = null

// ---- Native upload state (mirrors server/utils/admin/mediaName.ts) ----
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
const uploadFile = ref<File | null>(null)
const uploadPreviewUrl = ref<string | null>(null)
const uploadName = ref('')
const uploadDestination = ref<'blog' | 'experiences'>('experiences')
const isUploadDragging = ref(false)
const uploading = ref(false)
const uploadError = ref<string | null>(null)

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

const uploadNameValid = computed(() =>
  /^[a-z0-9]+(-[a-z0-9]+)*\.webp$/.test(uploadName.value)
)

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
  uploadName.value = `${sanitizeUploadBasename(file.name)}.webp`
}

function onUploadFileChange(e: Event): void {
  const input = e.target as HTMLInputElement | null
  pickUploadFile(input?.files?.[0])
  if (input) input.value = ''
}

function onUploadDrop(e: DragEvent): void {
  isUploadDragging.value = false
  pickUploadFile(e.dataTransfer?.files?.[0])
}

function sanitizeUploadName(): void {
  const seed = uploadName.value.trim() !== '' ? uploadName.value : (uploadFile.value?.name ?? 'image')
  uploadName.value = `${sanitizeUploadBasename(seed)}.webp`
}

async function uploadToGallery(): Promise<void> {
  if (!uploadFile.value || uploading.value) return
  if (!uploadNameValid.value) sanitizeUploadName()
  uploading.value = true
  uploadError.value = null
  try {
    const form = new FormData()
    form.append('file', uploadFile.value, uploadName.value)
    form.append('filename', uploadName.value)
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
    // Make the new asset visible in the picker AND append it to the
    // `gallery` frontmatter array so the thumbnail renders immediately.
    mediaItems.value = [
      { filename: res.filename ?? res.url, url: res.url, isLocal: true },
      ...mediaItems.value,
    ]
    pickerLoaded.value = true
    add(res.url)
    revokeUploadPreview()
    uploadFile.value = null
    uploadName.value = ''
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : 'Upload failed.'
  } finally {
    uploading.value = false
  }
}

onBeforeUnmount(() => {
  revokeUploadPreview()
})

function setItems(next: string[]): void {
  emit('update:modelValue', next)
}

function move(index: number, delta: -1 | 1): void {
  const next = [...items.value]
  const target = index + delta
  if (target < 0 || target >= next.length) return
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved)
  setItems(next)
}

function remove(index: number): void {
  setItems(items.value.filter((_, i) => i !== index))
  if (lightboxIndex.value !== null && lightboxIndex.value >= items.value.length - 1) {
    lightboxIndex.value = items.value.length - 2 >= 0 ? items.value.length - 2 : null
  }
}

function isAllowedUrl(url: string): boolean {
  const trimmed = url.trim()
  return (
    trimmed.startsWith('/images/blog/') ||
    trimmed.startsWith('/images/experiences/') ||
    trimmed.startsWith('https://res.cloudinary.com/') ||
    /^https?:\/\/.+\.(webp|jpe?g|png|gif|avif)(\?.*)?$/i.test(trimmed)
  )
}

function add(url: string): void {
  const trimmed = url.trim()
  if (!trimmed || items.value.includes(trimmed)) return
  if (!isAllowedUrl(trimmed)) {
    manualError.value = 'URL must be /images/… or a direct image link (webp/jpg/png/gif/avif).'
    return
  }
  manualError.value = null
  setItems([...items.value, trimmed])
}

function addManual(): void {
  if (!manualUrl.value.trim()) return
  add(manualUrl.value.trim())
  if (!manualError.value) manualUrl.value = ''
}

async function togglePicker(): Promise<void> {
  isPickerOpen.value = !isPickerOpen.value
  if (isPickerOpen.value && !pickerLoaded.value) await loadMedia()
}

async function loadMedia(): Promise<void> {
  pickerLoading.value = true
  pickerError.value = null
  try {
    const res = await $fetch<{
      success: boolean
      data?: { filename: string; url: string; isLocal: boolean }[]
    }>('/api/admin/media')
    mediaItems.value = Array.isArray(res?.data) ? res.data : []
    pickerLoaded.value = true
  } catch (err) {
    pickerError.value = err instanceof Error ? err.message : 'Failed to load media assets.'
  } finally {
    pickerLoading.value = false
  }
}

const filteredMedia = computed(() => {
  const q = pickerSearch.value.trim().toLowerCase()
  if (!q) return mediaItems.value
  return mediaItems.value.filter((a) =>
    `${a.filename ?? ''} ${a.url ?? ''}`.toLowerCase().includes(q)
  )
})

function openLightbox(index: number, event?: Event): void {
  lastFocusedThumb =
    (event?.currentTarget as HTMLElement | null) ??
    (document.activeElement as HTMLElement | null)
  lightboxIndex.value = index
  nextTick(() => {
    lightboxCloseRef.value?.focus()
  })
}

function closeLightbox(): void {
  lightboxIndex.value = null
  nextTick(() => {
    try {
      lastFocusedThumb?.focus()
    } catch {
      // best effort focus restore
    }
    lastFocusedThumb = null
  })
}

function stepLightbox(delta: -1 | 1): void {
  if (lightboxIndex.value === null || items.value.length === 0) return
  const next = (lightboxIndex.value + delta + items.value.length) % items.value.length
  lightboxIndex.value = next
}

function onLightboxKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    e.stopPropagation()
    closeLightbox()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    stepLightbox(-1)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    stepLightbox(1)
  }
}
</script>

<style scoped>
.gallery-manager {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
}

.gallery-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.fm-field-label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.gallery-add-toggle {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 60px;
  border: 1px solid rgba(var(--accent-rgb, 201, 168, 124), 0.55);
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.14);
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
  white-space: nowrap;
}

.gallery-add-toggle:hover {
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.24);
}

.gallery-add-toggle:active {
  transform: scale(0.96);
}

.gallery-add-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.6rem;
}

.gallery-thumb {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.35);
  aspect-ratio: 4 / 3;
}

.gallery-thumb-btn {
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: zoom-in;
  display: block;
}

.gallery-thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-thumb-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.gallery-index {
  position: absolute;
  top: 0.35rem;
  inset-inline-start: 0.35rem;
  min-width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.4rem;
  border-radius: 60px;
  background: rgba(5, 8, 16, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
}

.gallery-thumb-actions {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.35rem;
  background: linear-gradient(to top, rgba(5, 8, 16, 0.8), transparent);
}

.gallery-mini-btn {
  min-width: 40px;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.15s ease;
}

.gallery-mini-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.24);
}

.gallery-mini-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.gallery-mini-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.gallery-mini-btn--danger:hover:not(:disabled) {
  background: rgba(251, 113, 133, 0.35);
  border-color: rgba(251, 113, 133, 0.6);
}

.gallery-mini-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.gallery-empty {
  margin: 0;
  padding: 1rem;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  color: var(--text-secondary);
  font-size: 0.82rem;
  text-align: center;
}

/* Asset picker */
.gallery-picker {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.8rem;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.25);
}

.gallery-picker-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.gallery-picker-row .fm-input {
  flex: 1;
  min-width: 0;
}

.fm-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.8rem;
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.25);
  color: var(--text-primary);
  font-size: 0.88rem;
}

.fm-input:focus {
  outline: none;
  border-color: var(--accent);
}

.fm-input--slug {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.8rem;
}

.gallery-refresh {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  cursor: pointer;
}

.gallery-refresh:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.is-spinning {
  animation: gallery-spin 1s linear infinite;
}

@keyframes gallery-spin {
  to {
    transform: rotate(360deg);
  }
}

.gallery-picker-loading,
.gallery-picker-empty {
  color: var(--text-secondary);
  font-size: 0.82rem;
  text-align: center;
  padding: 0.6rem;
}

.gallery-picker-error,
.gallery-manual-error {
  color: #fecaca;
  font-size: 0.8rem;
  margin: 0;
}

.gallery-picker-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 0.45rem;
  max-height: 220px;
  overflow-y: auto;
  margin: 0;
  padding: 0.1rem;
  list-style: none;
}

.gallery-asset {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  padding: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: border-color 0.18s ease, transform 0.15s ease;
}

.gallery-asset:hover:not(:disabled) {
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.6);
  transform: scale(1.03);
}

.gallery-asset:disabled {
  opacity: 0.45;
  cursor: default;
}

.gallery-asset img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-asset:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.gallery-asset-check {
  position: absolute;
  bottom: 0.25rem;
  inset-inline-end: 0.25rem;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(5, 8, 16, 0.8);
  color: var(--accent);
}

.gallery-url-row {
  display: flex;
  gap: 0.5rem;
}
.gallery-url-row .fm-input {
  flex: 1;
  min-width: 0;
}

.gallery-add-url {
  flex-shrink: 0;
  min-height: 44px;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(var(--accent-rgb, 201, 168, 124), 0.55);
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.16);
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.gallery-add-url:hover {
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.26);
}

.gallery-add-url:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Native upload block */
.gallery-upload {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.65rem;
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.2);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.gallery-upload--dragging {
  border-color: var(--accent);
  background: rgba(201, 168, 124, 0.08);
}

.gallery-upload-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.gallery-upload-btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(var(--accent-rgb, 201, 168, 124), 0.55);
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.16);
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.gallery-upload-btn:hover {
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.26);
}

.gallery-upload-dests {
  display: inline-flex;
  gap: 0.3rem;
  margin-inline-start: auto;
}

.gallery-dest {
  min-height: 40px;
  padding: 0.35rem 0.8rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.gallery-dest--active {
  background: rgba(201, 168, 124, 0.18);
  border-color: rgba(201, 168, 124, 0.5);
  color: var(--accent);
}

.gallery-upload-detail {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}

.gallery-upload-preview {
  width: 96px;
  height: 72px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.4);
}

.gallery-upload-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.gallery-upload-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  border-radius: 60px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.gallery-upload-badge--ok {
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.5);
  color: #a7f3d0;
}

.gallery-upload-badge--warn {
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #fde68a;
}

.gallery-upload-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.gallery-sanitize {
  min-height: 44px;
  padding: 0.4rem 0.9rem;
  border-radius: 10px;
  border: 1px solid rgba(251, 191, 36, 0.6);
  background: rgba(251, 191, 36, 0.16);
  color: #fde68a;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.gallery-sanitize:hover {
  background: rgba(251, 191, 36, 0.28);
}

.gallery-sanitize:focus-visible,
.gallery-dest:focus-visible,
.gallery-upload-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Glass lightbox */
.gallery-lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(4, 6, 12, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.gallery-lightbox-card {
  width: min(880px, 100%);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.8rem;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.02)),
    rgba(10, 14, 26, 0.85);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
}

.gallery-lightbox-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gallery-lightbox-count {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.gallery-lightbox-img {
  width: 100%;
  max-height: 64vh;
  object-fit: contain;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.4);
}

.gallery-lightbox-nav {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
}

.gallery-lightbox-btn {
  min-width: 48px;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-primary);
  cursor: pointer;
}

.gallery-lightbox-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.gallery-lightbox-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.gallery-lightbox-enter-active,
.gallery-lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.gallery-lightbox-enter-from,
.gallery-lightbox-leave-to {
  opacity: 0;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .gallery-add-toggle,
  .gallery-mini-btn,
  .gallery-asset,
  .is-spinning,
  .gallery-lightbox-enter-active,
  .gallery-lightbox-leave-active {
    animation: none;
    transition: none;
  }
}
</style>
