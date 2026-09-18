<template>
  <Teleport to="body" :disabled="!isOpen">
    <Transition name="mdc-modal">
      <div v-if="isOpen" class="mdc-overlay" @click.self="emit('close')">
        <div
          class="mdc-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="MDC components inspector"
        >
          <div class="mdc-head">
            <span class="mdc-title">🧩 مكونات MDC / Components — {{ activeLocale }}</span>
            <button type="button" class="mdc-close" aria-label="Close" @click="emit('close')">
              ✕
            </button>
          </div>

          <div class="mdc-layout">
            <aside class="mdc-tabs" role="tablist">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                role="tab"
                class="mdc-tab"
                :class="{ 'mdc-tab--active': activeTab === tab.id }"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </aside>

            <div class="mdc-form">
              <template v-if="activeTab === 'booking-card'">
                <label class="mdc-field">
                  <span class="mdc-field-label">Service (official catalog)</span>
                  <select v-model="bookingServiceId" class="mdc-input">
                    <option v-for="service in servicesCatalog" :key="service.id" :value="service.id">
                      {{ service.titles[activeLocale] }} — {{ service.prices.mad }}
                    </option>
                  </select>
                </label>
                <p class="mdc-hint">Title, price and link adapt automatically to {{ activeLocale }}.</p>
              </template>

              <template v-else-if="activeTab === 'group-promo'">
                <label class="mdc-field">
                  <span class="mdc-field-label">Title</span>
                  <input v-model="promoTitle" type="text" class="mdc-input" />
                </label>
                <label class="mdc-field">
                  <span class="mdc-field-label">Discount amount (number, bound with `:`)</span>
                  <input v-model.number="promoAmount" type="number" min="0" class="mdc-input" dir="ltr" />
                </label>
                <label class="mdc-field">
                  <span class="mdc-field-label">Condition</span>
                  <input v-model="promoCondition" type="text" class="mdc-input" />
                </label>
              </template>

              <template v-else-if="activeTab === 'info-alert'">
                <label class="mdc-field">
                  <span class="mdc-field-label">Title</span>
                  <input v-model="alertTitle" type="text" class="mdc-input" />
                </label>
                <label class="mdc-field">
                  <span class="mdc-field-label">Text</span>
                  <textarea v-model="alertText" rows="3" class="mdc-input"></textarea>
                </label>
                <label class="mdc-field">
                  <span class="mdc-field-label">Link (optional, must start with /{{ activeLocale }})</span>
                  <input v-model="alertLink" type="text" class="mdc-input" dir="ltr" />
                </label>
                <p v-if="alertLink && !alertLinkValid" class="mdc-warning">
                  Link ignored: must start with /{{ activeLocale }}.
                </p>
              </template>

              <template v-else-if="activeTab === 'map-embed'">
                <label class="mdc-field">
                  <span class="mdc-field-label">Title (optional)</span>
                  <input v-model="mapTitle" type="text" class="mdc-input" />
                </label>
              </template>

              <template v-else-if="activeTab === 'comparison-table'">
                <label class="mdc-field">
                  <span class="mdc-field-label">Title</span>
                  <input v-model="comparisonTitle" type="text" class="mdc-input" />
                </label>
                <label class="mdc-field">
                  <span class="mdc-field-label">Subtitle</span>
                  <input v-model="comparisonSubtitle" type="text" class="mdc-input" />
                </label>
                <p class="mdc-hint">Starter rows included — edit labels, values and winners after insertion.</p>
              </template>

              <template v-else-if="activeTab === 'social-embed'">
                <label class="mdc-field">
                  <span class="mdc-field-label">Platform</span>
                  <select v-model="socialPlatform" class="mdc-input">
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </label>
                <label class="mdc-field">
                  <span class="mdc-field-label">URL / Embed link</span>
                  <input
                    v-model="socialUrl"
                    type="text"
                    class="mdc-input"
                    dir="ltr"
                    placeholder="https://www.instagram.com/p/DaX04hIsX87/"
                  />
                </label>
                <label class="mdc-field">
                  <span class="mdc-field-label">Caption / Title (optional, visual preview only)</span>
                  <input v-model="socialCaption" type="text" class="mdc-input" />
                </label>
                <p class="mdc-hint">{{ socialPlatformHint }}</p>
                <p v-if="socialUrl && !socialEmbedId" class="mdc-warning">
                  Could not extract an embed ID from this link — paste a full share URL or raw ID.
                </p>
                <p class="mdc-hint">SocialEmbed takes platform + id — caption is preview-only, not inserted.</p>
              </template>

              <template v-else>
                <p class="mdc-hint">One-click insert — no configuration needed.</p>
              </template>

              <div class="mdc-visual-preview-wrap">
                <span class="mdc-field-label">Visual preview</span>
                <div class="mdc-visual-preview" dir="auto">
                  <template v-if="activeTab === 'booking-card'">
                    <div class="mdc-mock-booking">
                      <div class="mdc-mock-booking-title">{{ bookingPreviewService.titles[activeLocale] }}</div>
                      <div class="mdc-mock-booking-price">{{ bookingPreviewService.prices.mad }}</div>
                      <span class="mdc-mock-booking-btn">Book Now</span>
                    </div>
                  </template>
                  <template v-else-if="activeTab === 'group-promo'">
                    <div class="mdc-mock-promo">
                      <div class="mdc-mock-promo-title">{{ promoTitle || 'Group offer title' }}</div>
                      <div class="mdc-mock-promo-discount">Save {{ promoAmount }} per person!</div>
                      <div class="mdc-mock-promo-condition">{{ promoCondition || 'Condition…' }}</div>
                    </div>
                  </template>
                  <template v-else-if="activeTab === 'info-alert'">
                    <div class="mdc-mock-alert">
                      <div class="mdc-mock-alert-title">{{ alertTitle || 'Callout title' }}</div>
                      <p class="mdc-mock-alert-text">{{ alertText || 'Callout text…' }}</p>
                    </div>
                  </template>
                  <template v-else-if="activeTab === 'map-embed'">
                    <div class="mdc-mock-map">
                      <div class="mdc-mock-map-title">{{ mapTitle || 'Kasbat Souss, Agadir' }}</div>
                      <div class="mdc-mock-map-frame">🗺 Map embed</div>
                    </div>
                  </template>
                  <template v-else-if="activeTab === 'social-embed'">
                    <div class="mdc-mock-social" :class="`mdc-mock-social--${socialPlatform}`">
                      <iframe
                        v-if="socialEmbedSrc"
                        :src="socialEmbedSrc"
                        class="mdc-mock-social-frame"
                        frameborder="0"
                        allowfullscreen
                        loading="lazy"
                        :title="`${socialPlatform} embed preview`"
                      ></iframe>
                      <div v-else class="mdc-mock-social-empty">
                        {{ socialPlatform }} embed — paste a link to preview
                      </div>
                      <div v-if="socialCaption" class="mdc-mock-social-caption">{{ socialCaption }}</div>
                    </div>
                  </template>
                  <template v-else-if="activeTab === 'comparison-table'">
                    <div class="mdc-mock-table-title">{{ comparisonTitle || 'Quad vs Buggy' }}</div>
                    <div class="mdc-mock-table-subtitle">{{ comparisonSubtitle || 'Choose your ride' }}</div>
                    <table class="mdc-mock-table">
                      <thead>
                        <tr><th>Feature</th><th>Quad</th><th>Buggy</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>Duration</td><td>2 hours</td><td>2 hours</td></tr>
                        <tr><td>Sensation</td><td>Solo freedom</td><td>Shared thrill</td></tr>
                      </tbody>
                    </table>
                  </template>
                  <template v-else-if="activeTab === 'prose-table'">
                    <table class="mdc-mock-table">
                      <thead>
                        <tr><th>Column 1</th><th>Column 2</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>Value</td><td>Value</td></tr>
                      </tbody>
                    </table>
                  </template>
                  <template v-else-if="activeTab === 'trust-badges'">
                    <div class="mdc-mock-badges">
                      <span>Free Cancellation</span><span>Local Guides</span><span>100% Safe</span>
                    </div>
                  </template>
                  <template v-else-if="activeTab === 'share-buttons'">
                    <div class="mdc-mock-share"><span></span><span></span><span></span></div>
                  </template>
                  <template v-else>
                    <p class="mdc-hint">Visual preview not needed for this component.</p>
                  </template>
                </div>
              </div>

              <details class="mdc-preview-wrap" open>
                <summary class="mdc-field-label mdc-preview-toggle">Live snippet preview (raw MDC)</summary>
                <pre class="mdc-preview" dir="ltr">{{ snippet }}</pre>
              </details>

              <div class="mdc-actions">
                <button type="button" class="mdc-cancel" @click="emit('close')">Cancel / إلغاء</button>
                <button type="button" class="mdc-confirm" @click="insert">إدراج المكون / Insert Component</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { servicesCatalog } from '~/data/servicesCatalog'
import type { StudioLocale } from '~/composables/admin/useStudio'

export type MdcTabId =
  | 'booking-card'
  | 'group-promo'
  | 'info-alert'
  | 'comparison-table'
  | 'map-embed'
  | 'social-embed'
  | 'trust-badges'
  | 'share-buttons'
  | 'prose-table'

export type SocialPlatform = 'instagram' | 'youtube' | 'tiktok'

// --mdc-snippet-start--
function buildBookingCardSnippet(title: string, price: string, link: string): string {
  return `:booking-card{title="${title}" price="${price}" link="${link}"}`
}

function buildGroupPromoSnippet(title: string, discountAmount: number, condition: string): string {
  return `:group-promo{title="${title}" :discountAmount="${discountAmount}" condition="${condition}"}`
}

function buildInfoAlertSnippet(title: string, text: string, link: string): string {
  return `:info-alert{title="${title}" text="${text}"${link ? ` link="${link}"` : ''}}`
}

function buildMapEmbedSnippet(title: string): string {
  return title ? `:map-embed{title="${title}"}` : ':map-embed'
}

function buildComparisonTableSnippet(title: string, subtitle: string): string {
  return [
    '::comparison-table',
    '---',
    `title: "${title}"`,
    `subtitle: "${subtitle}"`,
    'col1Header: "الميزة / Feature"',
    'col2Header: "كواد / Quad"',
    'col3Header: "باغي / Buggy"',
    'col2Price: "400 MAD"',
    'col3Price: "600 MAD"',
    'items:',
    '  - label: "Duration"',
    '    val1: "2 hours"',
    '    val2: "2 hours"',
    '    winner: "equal"',
    '  - label: "Sensation"',
    '    val1: "Solo riding freedom"',
    '    val2: "Shared 2-seater thrill"',
    '    winner: "col1"',
    '---',
    '::',
  ].join('\n')
}

function buildProseTableSnippet(): string {
  return '| Column 1 | Column 2 |\n| --- | --- |\n| Value | Value |'
}

function sanitizeMdcAttr(value: string): string {
  return value.trim().replace(/"/g, "'")
}

// SocialEmbed.vue takes `platform` + `id` (no `url` / `caption` props).
// Accept a full share URL or a raw ID and extract the embed ID.
function extractSocialId(platform: SocialPlatform, input: string): string {
  const raw = input.trim()
  if (!raw) return ''
  // Raw ID (no slashes / query): use as-is, sans quotes.
  if (!raw.includes('/') && !raw.includes('?') && !raw.includes('&')) {
    return raw.replace(/["\s]/g, '')
  }
  let path = raw
  try {
    // Prefer URL parsing when possible; fall back to string splitting.
    const parsed = new URL(raw)
    path = parsed.pathname + parsed.search
    if (platform === 'youtube') {
      const v = parsed.searchParams.get('v')
      if (v) return v.replace(/["\s]/g, '')
    }
  } catch {
    // not an absolute URL (e.g. pasted short link fragment) — split below
  }
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return ''
  if (platform === 'youtube') {
    const lowered = segments.map((s) => s.toLowerCase())
    const embedIdx = lowered.indexOf('embed')
    if (embedIdx >= 0 && segments[embedIdx + 1]) return segments[embedIdx + 1].split(/[?&#]/)[0]
    const shortsIdx = lowered.indexOf('shorts')
    if (shortsIdx >= 0 && segments[shortsIdx + 1]) return segments[shortsIdx + 1].split(/[?&#]/)[0]
    const last = segments[segments.length - 1].split(/[?&#]/)[0]
    return last.replace(/["\s]/g, '')
  }
  if (platform === 'instagram') {
    const lowered = segments.map((s) => s.toLowerCase())
    for (const key of ['p', 'reel', 'reels']) {
      const idx = lowered.indexOf(key)
      if (idx >= 0 && segments[idx + 1]) return segments[idx + 1].split(/[?&#]/)[0]
    }
    return segments[segments.length - 1].split(/[?&#]/)[0].replace(/["\s]/g, '')
  }
  // tiktok: numeric video id, usually after /video/
  const videoIdx = segments.map((s) => s.toLowerCase()).indexOf('video')
  if (videoIdx >= 0 && segments[videoIdx + 1]) return segments[videoIdx + 1].split(/[?&#]/)[0]
  for (let i = segments.length - 1; i >= 0; i--) {
    const candidate = segments[i].split(/[?&#]/)[0].replace(/["\s]/g, '')
    if (/^\d{5,}$/.test(candidate)) return candidate
  }
  return segments[segments.length - 1].split(/[?&#]/)[0].replace(/["\s]/g, '')
}

function buildSocialEmbedSnippet(platform: SocialPlatform, id: string): string {
  return `:social-embed{platform="${platform}" id="${sanitizeMdcAttr(id)}"}`
}

// Mirrors components/content/SocialEmbed.vue `src` computed (SSR-safe pure fn).
function buildSocialEmbedSrc(platform: SocialPlatform, id: string): string {
  if (!id) return ''
  if (platform === 'youtube') return `https://www.youtube.com/embed/${id}`
  if (platform === 'tiktok') return `https://www.tiktok.com/embed/${id}`
  return `https://www.instagram.com/p/${id}/embed`
}
// --mdc-snippet-end--

const props = defineProps<{
  isOpen: boolean
  activeLocale: StudioLocale
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'insert', snippet: string): void
}>()

const tabs: { id: MdcTabId; label: string }[] = [
  { id: 'booking-card', label: 'Cards' },
  { id: 'group-promo', label: 'Promo Banner' },
  { id: 'info-alert', label: 'Callout Box' },
  { id: 'comparison-table', label: 'Luxury Comparison' },
  { id: 'map-embed', label: 'Google Maps' },
  { id: 'social-embed', label: 'Social / Video 🎬' },
  { id: 'trust-badges', label: 'Trust (Instant)' },
  { id: 'share-buttons', label: 'Share (Instant)' },
  { id: 'prose-table', label: 'Markdown Table' },
]

const activeTab = ref<MdcTabId>('booking-card')
const bookingServiceId = ref('quad-biking')
const promoTitle = ref('')
const promoAmount = ref(50)
const promoCondition = ref('')
const alertTitle = ref('')
const alertText = ref('')
const alertLink = ref('')
const mapTitle = ref('')
const comparisonTitle = ref('')
const comparisonSubtitle = ref('')
const socialPlatform = ref<SocialPlatform>('instagram')
const socialUrl = ref('')
const socialCaption = ref('')

const alertLinkValid = computed(() => {
  const link = alertLink.value.trim()
  return link === '' || link.startsWith(`/${props.activeLocale}`)
})

const bookingPreviewService = computed(
  () => servicesCatalog.find((s) => s.id === bookingServiceId.value) ?? servicesCatalog[0]
)

const socialEmbedId = computed(() => extractSocialId(socialPlatform.value, socialUrl.value))

const socialEmbedSrc = computed(() => buildSocialEmbedSrc(socialPlatform.value, socialEmbedId.value))

const socialPlatformHint = computed(() => {
  if (socialPlatform.value === 'youtube') return 'Paste a watch / youtu.be / shorts link or a raw video ID.'
  if (socialPlatform.value === 'tiktok') return 'Paste a TikTok video link or a raw numeric video ID.'
  return 'Paste an Instagram post / reel link or a raw shortcode.'
})

const snippet = computed(() => {
  switch (activeTab.value) {
    case 'booking-card': {
      const service =
        servicesCatalog.find((s) => s.id === bookingServiceId.value) ?? servicesCatalog[0]
      return buildBookingCardSnippet(
        service.titles[props.activeLocale],
        service.prices.mad,
        service.links[props.activeLocale]
      )
    }
    case 'group-promo':
      return buildGroupPromoSnippet(
        promoTitle.value,
        Number.isNaN(promoAmount.value) ? 50 : promoAmount.value,
        promoCondition.value
      )
    case 'info-alert':
      return buildInfoAlertSnippet(
        alertTitle.value,
        alertText.value,
        alertLinkValid.value ? alertLink.value.trim() : ''
      )
    case 'map-embed':
      return buildMapEmbedSnippet(mapTitle.value.trim())
    case 'social-embed':
      return buildSocialEmbedSnippet(socialPlatform.value, socialEmbedId.value)
    case 'comparison-table':
      return buildComparisonTableSnippet(comparisonTitle.value, comparisonSubtitle.value)
    case 'trust-badges':
      return ':trust-badges'
    case 'share-buttons':
      return ':share-buttons'
    case 'prose-table':
      return buildProseTableSnippet()
    default:
      return ''
  }
})

function insert(): void {
  if (!snippet.value) return
  emit('insert', snippet.value)
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
.mdc-overlay {
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

.mdc-dialog {
  width: min(48rem, 100%);
  max-height: min(86vh, 780px);
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: rgba(13, 17, 29, 0.97);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.mdc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--glass-border);
}

.mdc-title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  color: var(--text-primary);
}

.mdc-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  cursor: pointer;
}

.mdc-layout {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  min-height: 0;
  flex: 1 1 auto;
}

@media (max-width: 640px) {
  .mdc-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

.mdc-tabs {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.9rem 0.6rem;
  border-inline-end: 1px solid var(--glass-border);
  overflow-y: auto;
}

@media (max-width: 640px) {
  .mdc-tabs {
    flex-direction: row;
    overflow-x: auto;
    border-inline-end: none;
    border-bottom: 1px solid var(--glass-border);
  }
}

.mdc-tab {
  padding: 0.55rem 0.8rem;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  text-align: start;
  cursor: pointer;
  white-space: nowrap;
}

.mdc-tab--active {
  background: rgba(201, 168, 124, 0.14);
  border-color: rgba(201, 168, 124, 0.45);
  color: var(--accent);
}

.mdc-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  overflow-y: auto;
  min-width: 0;
}

.mdc-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.mdc-field-label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.mdc-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.25);
  color: var(--text-primary);
  font-size: 0.88rem;
}

.mdc-input:focus {
  outline: none;
  border-color: var(--accent);
}

select.mdc-input option {
  background: #10141f;
}

.mdc-hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.mdc-warning {
  margin: 0;
  font-size: 0.78rem;
  color: #fecaca;
}

.mdc-preview-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.mdc-preview-toggle {
  cursor: pointer;
  user-select: none;
}

.mdc-preview {
  margin: 0.3rem 0 0;
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.45);
  color: #a7f3d0;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 220px;
  overflow-y: auto;
}

.mdc-visual-preview-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.mdc-visual-preview {
  min-height: 140px;
  max-height: 260px;
  overflow-y: auto;
  padding: 0.9rem;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.03);
  contain: content;
}

.mdc-mock-booking,
.mdc-mock-promo,
.mdc-mock-alert,
.mdc-mock-map {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid rgba(201, 168, 124, 0.35);
  background: rgba(0, 0, 0, 0.25);
}

.mdc-mock-booking-title,
.mdc-mock-promo-title,
.mdc-mock-alert-title,
.mdc-mock-map-title,
.mdc-mock-table-title {
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
}

.mdc-mock-booking-price,
.mdc-mock-promo-discount {
  color: var(--accent);
  font-size: 1.25rem;
  font-weight: 700;
}

.mdc-mock-booking-btn {
  padding: 0.4rem 1.2rem;
  border-radius: 60px;
  background: #25d366;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
}

.mdc-mock-promo-condition,
.mdc-mock-alert-text,
.mdc-mock-table-subtitle {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin: 0;
}

.mdc-mock-map-frame {
  width: 100%;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(127, 181, 208, 0.1);
  border: 1px dashed rgba(127, 181, 208, 0.5);
  font-size: 0.85rem;
}

.mdc-mock-social {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.35);
}

.mdc-mock-social--youtube {
  aspect-ratio: 16 / 9;
}

.mdc-mock-social--instagram {
  aspect-ratio: 4 / 5;
  max-height: 220px;
}

.mdc-mock-social--tiktok {
  aspect-ratio: 9 / 16;
  max-width: 220px;
  max-height: 220px;
}

.mdc-mock-social-frame {
  width: 100%;
  height: 100%;
  min-height: 160px;
  border: 0;
  display: block;
}

.mdc-mock-social-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-align: center;
}

.mdc-mock-social-caption {
  padding: 0.5rem 0.8rem;
  font-size: 0.78rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--glass-border);
}

.mdc-mock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.mdc-mock-table th,
.mdc-mock-table td {
  padding: 0.5rem 0.7rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-align: start;
  color: var(--text-secondary);
}

.mdc-mock-table th {
  color: var(--accent);
  background: rgba(201, 168, 124, 0.12);
}

.mdc-mock-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--text-primary);
}

.mdc-mock-badges span {
  padding: 0.35rem 0.8rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
}

.mdc-mock-share {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
}

.mdc-mock-share span {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid var(--glass-border);
}

.mdc-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
}

.mdc-cancel {
  padding: 0.55rem 1.1rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
}

.mdc-confirm {
  padding: 0.55rem 1.3rem;
  border-radius: 60px;
  border: none;
  background: var(--accent);
  color: #000;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.mdc-modal-enter-active,
.mdc-modal-leave-active {
  transition: opacity 0.25s ease;
}

.mdc-modal-enter-from,
.mdc-modal-leave-to {
  opacity: 0;
}
</style>
