<template>
  <section class="fm-panel">
    <button type="button" class="fm-bar" @click="toggle" :aria-expanded="isExpanded">
      <span class="fm-summary">
        <span class="fm-health" :class="`fm-health--${seoHealthy ? 'good' : 'warn'}`"></span>
        <span class="fm-type" :class="`fm-type--${isExperience ? 'exp' : 'blog'}`">
          <AdminIcon :name="isExperience ? 'compass' : 'file-text'" :size="13" />
          <span>{{ isExperience ? 'Experience' : 'Article' }}</span>
        </span>
        <span class="fm-title-preview">{{ titleValue || 'Untitled' }}</span>
      </span>
      <span class="fm-pills">
        <span class="fm-pill">Title: {{ titleValue.length }}/60</span>
        <span class="fm-pill">Desc: {{ descriptionValue.length }}/160</span>
      </span>
      <span class="fm-toggle">
        <span class="fm-toggle-chevron" :class="{ 'fm-toggle-chevron--open': isExpanded }">▼</span>
        إعدادات السيو والميتاداتا / SEO &amp; Metadata
      </span>
    </button>

    <div v-if="isExpanded && currentArticle" class="fm-body">
      <div class="fm-fields">
        <label class="fm-field">
          <span class="fm-field-label">Title / العنوان</span>
          <input
            v-model="currentArticle.metadata.title"
            type="text"
            class="fm-input"
            :dir="activeLocale === 'ar' ? 'rtl' : 'ltr'"
            @input="onTitleInput"
          />
          <AdminSeoMeter
            :current-length="titleValue.length"
            :min-optimal="40"
            :max-optimal="60"
            :max-allowed="70"
          />
        </label>

        <label class="fm-field">
          <span class="fm-field-label">Description / الوصف</span>
          <textarea
            v-model="currentArticle.metadata.description"
            rows="3"
            class="fm-input fm-textarea"
            :dir="activeLocale === 'ar' ? 'rtl' : 'ltr'"
            @input="onFieldChange"
          ></textarea>
          <AdminSeoMeter
            :current-length="descriptionValue.length"
            :min-optimal="150"
            :max-optimal="160"
            :max-allowed="175"
          />
        </label>

        <div class="fm-field">
          <span class="fm-field-label">Slug / المعرف</span>
          <div class="fm-slug-row">
            <input
              v-model="slugDraft"
              type="text"
              class="fm-input fm-input--slug"
              dir="ltr"
              :disabled="isSlugLocked"
              @input="onFieldChange"
            />
            <button
              type="button"
              class="fm-lock"
              :class="{ 'fm-lock--locked': isSlugLocked }"
              :title="
                isSlugLocked
                  ? 'Unlock slug editing (renaming breaks existing URLs)'
                  : 'Lock slug'
              "
              :aria-label="isSlugLocked ? 'Slug locked — activate to unlock' : 'Slug unlocked — activate to lock'"
              @click="toggleSlugLock"
            >
              <AdminIcon name="lock" :size="15" />
            </button>
          </div>
          <span v-if="slugDraft !== savedSlug" class="fm-warning">
            Slug differs from the saved file slug — saving keeps "{{ savedSlug }}".
          </span>
        </div>

        <div class="fm-field">
          <span class="fm-field-label">Featured Image / الصورة</span>
          <div class="fm-image-row">
            <img
              v-if="imageValid && imageValue && imageProbe !== 'broken'"
              :src="imageValue"
              alt=""
              class="fm-thumb"
              width="48"
              height="48"
            />
            <input
              v-model="currentArticle.metadata.image"
              type="text"
              class="fm-input"
              dir="ltr"
              :placeholder="isExperience ? '/images/experiences/...' : '/images/blog/...'"
              :aria-invalid="imageProbe === 'broken'"
              :aria-describedby="imageProbe === 'broken' ? 'fm-image-status' : undefined"
              @input="onFieldChange"
            />
            <span id="fm-image-status" class="fm-valid" :class="`fm-valid--${imageStatusTone}`" role="status">
              <AdminIcon :name="imageStatusIcon" :size="14" :class="{ 'is-spinning': imageProbe === 'checking' }" />
              <span>{{ imageStatusText }}</span>
            </span>
            <button type="button" class="fm-pick" @click="emit('open-media', 'featured')">
              <AdminIcon name="image" :size="15" />
              <span>اختيار صورة / Pick Media</span>
            </button>
          </div>
          <div v-if="nameIssues.length > 0" class="fm-image-warn" role="alert">
            <AdminIcon name="alert" :size="14" />
            <span>Filename uses {{ nameIssues.join(' + ') }} — unsafe for URLs.</span>
            <button type="button" class="fm-sanitize" @click="sanitizeImageName">
              Sanitize to kebab-case .webp
            </button>
          </div>
        </div>

        <!-- Experience-only commerce fields: price / duration / fleet -->
        <template v-if="isExperience">
          <div class="fm-row">
            <label class="fm-field">
              <span class="fm-field-label">Price (MAD)</span>
              <input
                :value="priceValue"
                type="number"
                min="1"
                step="1"
                class="fm-input"
                dir="ltr"
                @input="setPrice(Number(($event.target as HTMLInputElement).value))"
              />
              <span class="fm-hint">≈ €{{ priceEur }} · Official catalog price in MAD</span>
            </label>
            <label class="fm-field">
              <span class="fm-field-label">Duration</span>
              <input
                v-model="currentArticle.metadata.duration"
                type="text"
                class="fm-input"
                dir="auto"
                placeholder="2 hours"
                @input="onFieldChange"
              />
              <span class="fm-hint">e.g. "2 hours", "4-5 hours"</span>
            </label>
          </div>

          <div class="fm-row fm-row--3">
            <label class="fm-field">
              <span class="fm-field-label">Category</span>
              <input
                v-model="currentArticle.metadata.category"
                type="text"
                class="fm-input"
                dir="ltr"
                placeholder="desert"
                @input="onFieldChange"
              />
            </label>
            <label class="fm-field">
              <span class="fm-field-label">Vehicle</span>
              <input
                v-model="currentArticle.metadata.vehicle"
                type="text"
                class="fm-input"
                dir="auto"
                placeholder="2-seater buggy"
                @input="onFieldChange"
              />
            </label>
            <label class="fm-field">
              <span class="fm-field-label">Seats / Capacity</span>
              <input
                v-model="currentArticle.metadata.seats"
                type="text"
                class="fm-input"
                dir="auto"
                placeholder="2-seater"
                @input="onFieldChange"
              />
            </label>
          </div>

          <div class="fm-field">
            <AdminExperienceGallery :model-value="galleryArray" @update:model-value="setGallery" />
            <span class="fm-hint">Stored as the `gallery` frontmatter array</span>
          </div>
        </template>

        <div v-if="!isExperience" class="fm-row">
          <label class="fm-field">
            <span class="fm-field-label">Author / الكاتب</span>
            <input
              v-model="currentArticle.metadata.author"
              type="text"
              class="fm-input"
              placeholder="Agadir Berbère Team"
              @input="onFieldChange"
            />
          </label>
          <label class="fm-field">
            <span class="fm-field-label">Date / التاريخ</span>
            <input
              v-model="currentArticle.metadata.date"
              type="date"
              class="fm-input"
              dir="ltr"
              @input="onFieldChange"
            />
          </label>
        </div>
        <div v-else class="fm-row">
          <label class="fm-field">
            <span class="fm-field-label">Author (optional)</span>
            <input
              v-model="currentArticle.metadata.author"
              type="text"
              class="fm-input"
              placeholder="Agadir Berbère Team"
              @input="onFieldChange"
            />
          </label>
          <label class="fm-field">
            <span class="fm-field-label">Date (optional)</span>
            <input
              v-model="currentArticle.metadata.date"
              type="date"
              class="fm-input"
              dir="ltr"
              @input="onFieldChange"
            />
          </label>
        </div>

        <div class="fm-field">
          <span class="fm-field-label">Canonical URL / sitemap.loc (auto)</span>
          <input :value="canonicalLoc" type="text" class="fm-input fm-input--locked" dir="ltr" readonly />
        </div>
      </div>

      <div class="fm-preview">
        <AdminSerpPreview
          :title="titleValue"
          :description="descriptionValue"
          :slug="slugDraft"
          :locale="activeLocale"
          :content-type="isExperience ? 'experience' : 'blog'"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { useStudio } from '~/composables/admin/useStudio'

type Studio = ReturnType<typeof useStudio>

const studio = inject<Studio>('cms-studio')
if (!studio) {
  throw new Error('FrontmatterPanel must be used inside the CMS Studio workspace.')
}

const emit = defineEmits<{
  (e: 'open-media', mode: 'featured' | 'content'): void
}>()

const currentArticle = computed(() => studio.currentArticle.value)
const activeLocale = computed(() => studio.activeLocale.value)
const activeType = computed(() => studio.activeType.value ?? 'blog')
const isExperience = computed(() => activeType.value === 'experience')
const savedSlug = computed(() => studio.activeSlug.value)

const isExpanded = ref(false)
const isSlugLocked = ref(true)
const slugDraft = ref('')

let dirtyTimer: ReturnType<typeof setTimeout> | null = null

function toggle(): void {
  isExpanded.value = !isExpanded.value
}

defineExpose({ toggle, isExpanded })

function scheduleDirty(): void {
  if (dirtyTimer) clearTimeout(dirtyTimer)
  dirtyTimer = setTimeout(() => {
    studio.checkDirty()
  }, 200)
}

function onFieldChange(): void {
  scheduleDirty()
}

function slugify(text: string): string {
  const ascii = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const slug = ascii
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug
}

function onTitleInput(): void {
  if (!isSlugLocked.value) {
    const auto = slugify(String(currentArticle.value?.metadata?.title ?? ''))
    if (auto) slugDraft.value = auto
  }
  scheduleDirty()
}

function toggleSlugLock(): void {
  if (
    isSlugLocked.value &&
    typeof window !== 'undefined' &&
    !window.confirm('Unlock slug editing? Renaming breaks existing URLs. / فك القفل قد يكسر الروابط الحالية.')
  ) {
    return
  }
  isSlugLocked.value = !isSlugLocked.value
}

const titleValue = computed(() => String(currentArticle.value?.metadata?.title ?? ''))
const descriptionValue = computed(() => String(currentArticle.value?.metadata?.description ?? ''))
const imageValue = computed(() => String(currentArticle.value?.metadata?.image ?? ''))

// ---- Experience-specific computed fields ----
const priceValue = computed(() => {
  const raw = currentArticle.value?.metadata?.price
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  const num = Number(raw)
  return Number.isFinite(num) && String(raw ?? '').trim() !== '' ? num : 0
})

const priceEur = computed(() => Math.round(priceValue.value * 0.092 * 100) / 100)

function setPrice(next: number): void {
  const meta = currentArticle.value?.metadata as Record<string, unknown> | undefined
  if (!meta) return
  meta.price = Number.isFinite(next) && next > 0 ? Math.round(next) : next
  scheduleDirty()
}

const galleryArray = computed(() => {
  const gallery = currentArticle.value?.metadata?.gallery
  return Array.isArray(gallery) ? (gallery as unknown[]).map((g) => String(g)) : []
})

function setGallery(urls: string[]): void {
  const meta = currentArticle.value?.metadata as Record<string, unknown> | undefined
  if (!meta) return
  const clean = urls.map((u) => String(u).trim()).filter((u) => u !== '')
  if (clean.length === 0) {
    delete meta.gallery
  } else {
    meta.gallery = clean
  }
  scheduleDirty()
}

const imageValid = computed(
  () =>
    imageValue.value.startsWith('/images/blog/') ||
    imageValue.value.startsWith('/images/experiences/') ||
    imageValue.value.startsWith('https://res.cloudinary.com/')
)

// ---- Smart image validator: filename safety + live load probe ----
type ImageProbeState = 'idle' | 'checking' | 'valid' | 'broken'

const imageProbe = ref<ImageProbeState>('idle')
let probeTimer: ReturnType<typeof setTimeout> | null = null
let probeSeq = 0

const isLocalImage = computed(() => imageValue.value.startsWith('/images/'))

const imageFileName = computed(() => {
  const url = imageValue.value
  const slash = url.lastIndexOf('/')
  const tail = slash === -1 ? url : url.slice(slash + 1)
  return tail.split('?')[0]
})

/** Filename safety: local paths only (Cloudinary segments are opaque). */
const nameIssues = computed(() => {
  if (!isLocalImage.value || !imageFileName.value) return [] as string[]
  const name = imageFileName.value
  const issues: string[] = []
  if (/[A-Z]/.test(name)) issues.push('uppercase letters')
  if (/\s/.test(name)) issues.push('spaces')
  if (/[^a-zA-Z0-9.\-_() ]/.test(name)) issues.push('illegal characters')
  return issues
})

function sanitizeImageName(): void {
  const meta = currentArticle.value?.metadata as Record<string, unknown> | undefined
  if (!meta) return
  const url = imageValue.value
  const slash = url.lastIndexOf('/')
  const dir = slash === -1 ? '/images/blog/' : url.slice(0, slash + 1)
  let base = (slash === -1 ? url : url.slice(slash + 1)).split('?')[0]
  base = base
    .normalize('NFKD')
    .replace(/[^ -~]/g, '')
    .toLowerCase()
    .replace(/\.(webp|jpe?g|png|gif|avif)(\?.*)?$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  meta.image = `${dir}${base === '' ? 'image' : base}.webp`
  scheduleDirty()
}

// Live load probe: off-DOM Image tester, debounced, race-guarded.
// Client-only (never runs during SSR); advisory only — a failed probe
// never blocks saving (offline / remote outages must not lose work).
watch(
  imageValue,
  (url) => {
    if (probeTimer) clearTimeout(probeTimer)
    if (!url || typeof window === 'undefined' || typeof Image === 'undefined') {
      imageProbe.value = 'idle'
      return
    }
    imageProbe.value = 'checking'
    const seq = ++probeSeq
    probeTimer = setTimeout(() => {
      const tester = new Image()
      tester.onload = () => {
        if (seq === probeSeq) imageProbe.value = 'valid'
      }
      tester.onerror = () => {
        if (seq === probeSeq) imageProbe.value = 'broken'
      }
      tester.src = url
    }, 450)
  },
  { immediate: true }
)

const imageStatusTone = computed(() => {
  if (!imageValue.value) return 'warn'
  if (imageProbe.value === 'valid') return 'ok'
  if (imageProbe.value === 'broken') return 'bad'
  return 'warn'
})

const imageStatusIcon = computed(() => {
  if (imageProbe.value === 'valid') return 'check'
  if (imageProbe.value === 'checking') return 'refresh'
  return 'alert'
})

const imageStatusText = computed(() => {
  if (!imageValue.value) return 'No image set'
  if (imageProbe.value === 'valid') return 'Valid & Loaded'
  if (imageProbe.value === 'broken') return 'Image Not Found at path'
  if (imageProbe.value === 'checking') return 'Checking…'
  return 'Not checked'
})

const seoHealthy = computed(() => {
  const titleLen = titleValue.value.length
  const descLen = descriptionValue.value.length
  return titleLen >= 40 && titleLen <= 60 && descLen >= 150 && descLen <= 160
})

const canonicalLoc = computed(() => {
  const segment = isExperience.value ? 'experiences' : 'blog'
  return `/${activeLocale.value}/${segment}/${slugDraft.value}`
})

// Keep the slug input aligned with the loaded file slug.
watch(
  savedSlug,
  (next) => {
    slugDraft.value = next ?? ''
    // New/empty drafts start unlocked so the title can seed the slug.
    isSlugLocked.value = (next ?? '') !== ''
  },
  { immediate: true }
)

// Automated metadata sync: sitemap.loc always mirrors the canonical URL
// of the SAVED file slug. A renamed draft slug only previews until saved
// under the new identity, so saves can never fail validation.
watch(
  canonicalLoc,
  () => {
    const meta = currentArticle.value?.metadata as
      | { sitemap?: { loc?: string } }
      | undefined
    if (!meta || slugDraft.value !== savedSlug.value) return
    const loc = canonicalLoc.value
    if (!meta.sitemap || typeof meta.sitemap !== 'object') {
      meta.sitemap = { loc }
      scheduleDirty()
    } else if (meta.sitemap.loc !== loc) {
      meta.sitemap.loc = loc
      scheduleDirty()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (dirtyTimer) clearTimeout(dirtyTimer)
  if (probeTimer) clearTimeout(probeTimer)
})
</script>

<style scoped>
.fm-panel {
  flex-shrink: 0;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(10, 14, 26, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.fm-bar {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.82rem;
}

.fm-summary {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  flex: 1 1 0;
}

.fm-health {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.fm-health--good {
  background: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.8);
}

.fm-health--warn {
  background: #fbbf24;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
}

.fm-title-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
}

.fm-type {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.6rem;
  border-radius: 60px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.fm-type--blog {
  border: 1px solid rgba(96, 165, 250, 0.5);
  background: rgba(96, 165, 250, 0.14);
  color: #dbeafe;
}

.fm-type--exp {
  border: 1px solid rgba(var(--accent-rgb, 201, 168, 124), 0.55);
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.16);
  color: var(--accent);
}

.fm-hint {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.fm-pills {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.fm-pill {
  padding: 0.15rem 0.6rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.72rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.fm-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  color: var(--accent);
  font-size: 0.8rem;
  white-space: nowrap;
}

.fm-toggle-chevron {
  display: inline-block;
  font-size: 0.7rem;
  transition: transform 0.25s ease;
}

.fm-toggle-chevron--open {
  transform: rotate(180deg);
}

.fm-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.25rem;
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid var(--glass-border);
}

@media (max-width: 1023.5px) {
  .fm-body {
    grid-template-columns: minmax(0, 1fr);
  }
}

.fm-fields {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  min-width: 0;
}

.fm-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.fm-field-label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.fm-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.8rem;
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

.fm-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fm-textarea {
  resize: vertical;
  min-height: 3.5rem;
  line-height: 1.6;
}

.fm-input--slug,
.fm-input--locked {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.8rem;
}

.fm-slug-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.fm-slug-row .fm-input {
  flex: 1 1 auto;
  min-width: 0;
}

.fm-lock {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.fm-lock--locked {
  border-color: rgba(201, 168, 124, 0.45);
}

.fm-warning {
  font-size: 0.75rem;
  color: #fde68a;
}

.fm-image-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.fm-image-row .fm-input {
  flex: 1 1 auto;
  min-width: 0;
}

.fm-thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.fm-valid {
  flex-shrink: 0;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.65rem;
  border-radius: 60px;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
}

.fm-valid--ok {
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.5);
  color: #a7f3d0;
}

.fm-valid--bad {
  background: rgba(251, 113, 133, 0.15);
  border: 1px solid rgba(251, 113, 133, 0.5);
  color: #fecaca;
}

.fm-valid--warn {
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #fde68a;
}

.fm-image-warn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.45rem;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(251, 191, 36, 0.5);
  background: rgba(60, 42, 5, 0.5);
  color: #fde68a;
  font-size: 0.78rem;
}

.fm-sanitize {
  margin-inline-start: auto;
  min-height: 36px;
  padding: 0.35rem 0.85rem;
  border-radius: 60px;
  border: 1px solid rgba(251, 191, 36, 0.6);
  background: rgba(251, 191, 36, 0.16);
  color: #fde68a;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s ease, transform 0.15s ease;
}

.fm-sanitize:hover {
  background: rgba(251, 191, 36, 0.28);
}

.fm-sanitize:active {
  transform: scale(0.96);
}

.fm-sanitize:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.is-spinning {
  animation: fm-spin 1s linear infinite;
}

@keyframes fm-spin {
  to {
    transform: rotate(360deg);
  }
}

.fm-pick {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  border: 1px solid rgba(201, 168, 124, 0.45);
  background: rgba(201, 168, 124, 0.12);
  color: var(--accent);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.fm-pick:hover {
  background: rgba(201, 168, 124, 0.22);
}

.fm-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.75rem;
}

.fm-row--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 640px) {
  .fm-row,
  .fm-row--3 {
    grid-template-columns: minmax(0, 1fr);
  }
}

.fm-preview {
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .is-spinning {
    animation: none;
  }
}

@media (max-width: 1023.5px) {
  .fm-pills {
    display: none;
  }
}
</style>
