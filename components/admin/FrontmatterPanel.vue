<template>
  <section class="fm-panel">
    <button type="button" class="fm-bar" @click="toggle" :aria-expanded="isExpanded">
      <span class="fm-summary">
        <span class="fm-health" :class="`fm-health--${seoHealthy ? 'good' : 'warn'}`"></span>
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
              @click="toggleSlugLock"
            >
              {{ isSlugLocked ? '🔒' : '🔓' }}
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
              v-if="imageValid && imageValue"
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
              placeholder="/images/blog/..."
              @input="onFieldChange"
            />
            <span class="fm-valid" :class="`fm-valid--${imageValid ? 'ok' : 'bad'}`">
              {{ imageValid ? '✓' : '!' }}
            </span>
            <button type="button" class="fm-pick" @click="emit('open-media', 'featured')">
              🖼️ اختيار صورة / Pick Media
            </button>
          </div>
        </div>

        <div class="fm-row">
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

const imageValid = computed(
  () =>
    imageValue.value.startsWith('/images/blog/') ||
    imageValue.value.startsWith('https://res.cloudinary.com/')
)

const seoHealthy = computed(() => {
  const titleLen = titleValue.value.length
  const descLen = descriptionValue.value.length
  return titleLen >= 40 && titleLen <= 60 && descLen >= 150 && descLen <= 160
})

const canonicalLoc = computed(() => `/${activeLocale.value}/blog/${slugDraft.value}`)

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
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
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
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
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

.fm-pick {
  flex-shrink: 0;
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

@media (max-width: 640px) {
  .fm-row {
    grid-template-columns: minmax(0, 1fr);
  }
}

.fm-preview {
  min-width: 0;
}

@media (max-width: 1023.5px) {
  .fm-pills {
    display: none;
  }
}
</style>
