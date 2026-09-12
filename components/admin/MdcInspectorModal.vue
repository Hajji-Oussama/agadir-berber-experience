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

              <template v-else>
                <p class="mdc-hint">One-click insert — no configuration needed.</p>
              </template>

              <div class="mdc-preview-wrap">
                <span class="mdc-field-label">Live snippet preview</span>
                <pre class="mdc-preview" dir="ltr">{{ snippet }}</pre>
              </div>

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
  | 'trust-badges'
  | 'share-buttons'
  | 'prose-table'

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

const alertLinkValid = computed(() => {
  const link = alertLink.value.trim()
  return link === '' || link.startsWith(`/${props.activeLocale}`)
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

.mdc-preview {
  margin: 0;
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
