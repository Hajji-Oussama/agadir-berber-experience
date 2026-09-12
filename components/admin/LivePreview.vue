<template>
  <div
    ref="scrollRef"
    class="live-preview"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
    @scroll="onScroll"
    @click="onContainerClick"
  >
    <div class="preview-status">
      <span v-if="isParsing" class="status-pill status-pill--parsing">
        <span class="status-dot"></span>
        جارٍ التحديث... / Updating...
      </span>
      <span v-else-if="parseError" class="status-pill status-pill--warn">
        تنسيق غير مكتمل / Syntax in progress...
      </span>
    </div>

    <div class="preview-body">
      <AdminPreviewHero :metadata="metadata" :locale="locale" />
      <MDCRenderer
        v-if="renderBody"
        :body="renderBody"
        :data="renderData"
        :components="previewComponents"
      />
      <div v-else class="preview-fallback">
        <p v-for="(line, index) in fallbackLines" :key="index">{{ line }}</p>
      </div>
    </div>

    <Transition name="link-toast">
      <div v-if="linkToast" class="link-toast" dir="auto">{{ linkToast }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import BookingCard from '~/components/content/BookingCard.vue'
import ComparisonTable from '~/components/content/ComparisonTable.vue'
import GroupPromo from '~/components/content/GroupPromo.vue'
import InfoAlert from '~/components/content/InfoAlert.vue'
import SocialEmbed from '~/components/content/SocialEmbed.vue'
import ShareButtons from '~/components/content/ShareButtons.vue'
import ImageGallery from '~/components/content/ImageGallery.vue'
import TrustBadges from '~/components/content/TrustBadges.vue'
import MapEmbed from '~/components/content/MapEmbed.vue'
import ProseTable from '~/components/content/ProseTable.vue'
import type { StudioLocale } from '~/composables/admin/useStudio'
import type { MdcAst } from '~/composables/admin/useMdcRenderer'

const props = withDefaults(
  defineProps<{
    rawContent: string
    metadata?: Record<string, unknown>
    locale?: StudioLocale
    ast?: MdcAst | null
    isParsing?: boolean
    parseError?: string | null
  }>(),
  {
    metadata: () => ({}),
    locale: 'ar',
    ast: null,
    isParsing: false,
    parseError: null,
  }
)

const emit = defineEmits<{
  (e: 'scroll', ratio: number): void
}>()

const scrollRef = ref<HTMLElement | null>(null)
const linkToast = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null
let suppressEmit = false

const previewComponents = {
  'booking-card': BookingCard,
  'comparison-table': ComparisonTable,
  'group-promo': GroupPromo,
  'info-alert': InfoAlert,
  'social-embed': SocialEmbed,
  'share-buttons': ShareButtons,
  'image-gallery': ImageGallery,
  'trust-badges': TrustBadges,
  'map-embed': MapEmbed,
  table: ProseTable,
}

const renderBody = computed(() => {
  const body = (props.ast as { body?: unknown } | null)?.body
  return body ?? null
})

const renderData = computed(
  () => (props.ast as { data?: Record<string, unknown> } | null)?.data ?? {}
)

const fallbackLines = computed(() =>
  (props.rawContent || '').split('\n').filter((line) => line.trim() !== '').slice(0, 40)
)

function scrollRatio(): number {
  const el = scrollRef.value
  if (!el || el.scrollHeight <= el.clientHeight) return 0
  return el.scrollTop / (el.scrollHeight - el.clientHeight)
}

function onScroll(): void {
  if (suppressEmit) return
  emit('scroll', scrollRatio())
}

function scrollToRatio(ratio: number): void {
  const el = scrollRef.value
  if (!el) return
  suppressEmit = true
  try {
    el.scrollTop = Math.max(0, Math.min(1, ratio)) * (el.scrollHeight - el.clientHeight)
  } finally {
    requestAnimationFrame(() => {
      suppressEmit = false
    })
  }
}

function showLinkToast(href: string): void {
  const internal = href.startsWith('/') || href.includes('agadirberbereexperience.com')
  linkToast.value = internal ? `رابط داخلي: ${href}` : `رابط خارجي: ${href}`
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    linkToast.value = null
  }, 2600)
}

function onContainerClick(event: MouseEvent): void {
  const target = (event.target as HTMLElement | null)?.closest?.('a')
  if (!target) return
  event.preventDefault()
  showLinkToast(target.getAttribute('href') || '')
}

defineExpose({ scrollToRatio })

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
.live-preview {
  height: 100%;
  overflow-y: auto;
  position: relative;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
}

.preview-status {
  position: sticky;
  top: 0.75rem;
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  padding: 0 1rem;
  pointer-events: none;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.8rem;
  border-radius: 60px;
  font-size: 0.72rem;
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
}

.status-pill--parsing {
  color: #bfdbfe;
  border-color: rgba(96, 165, 250, 0.5);
}

.status-pill--parsing .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #60a5fa;
  animation: preview-pulse 1s ease-in-out infinite;
}

.status-pill--warn {
  color: #fde68a;
  border-color: rgba(251, 191, 36, 0.5);
}

@keyframes preview-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
}

.preview-body {
  padding: 1.5rem 1.75rem 3rem;
  max-width: 760px;
  margin: 0 auto;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.85;
}

.preview-body :deep(p) {
  margin: 0 0 1.25rem;
}

.preview-body :deep(h2) {
  font-family: var(--font-heading);
  font-weight: 400;
  color: var(--text-primary);
  font-size: 1.7rem;
  margin: 2.25rem 0 1rem;
  line-height: 1.4;
}

.preview-body :deep(h3) {
  font-family: var(--font-heading);
  font-weight: 400;
  color: var(--text-primary);
  font-size: 1.3rem;
  margin: 1.75rem 0 0.75rem;
}

.preview-body :deep(ul),
.preview-body :deep(ol) {
  padding-inline-start: 1.5rem;
  margin: 0 0 1.25rem;
}

.preview-body :deep(li) {
  margin-bottom: 0.4rem;
}

.preview-body :deep(a) {
  color: var(--accent);
  text-decoration: none;
  cursor: pointer;
}

.preview-body :deep(blockquote) {
  border-inline-start: 3px solid var(--accent);
  padding-inline-start: 1.1rem;
  color: var(--text-primary);
  font-style: italic;
  margin: 1.5rem 0;
}

.preview-body :deep(img) {
  max-width: 100%;
  border-radius: 14px;
  margin: 1.25rem 0;
}

.preview-body :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 2rem 0;
}

.preview-body :deep(table) {
  width: 100%;
}

.preview-fallback p {
  margin: 0 0 1rem;
}

.link-toast {
  position: sticky;
  bottom: 1rem;
  margin: 0 auto;
  width: max-content;
  max-width: calc(100% - 2rem);
  padding: 0.55rem 1.1rem;
  border-radius: 60px;
  background: rgba(10, 14, 26, 0.92);
  border: 1px solid rgba(201, 168, 124, 0.5);
  color: var(--accent);
  font-size: 0.8rem;
  font-family: ui-monospace, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 6;
}

.link-toast-enter-active,
.link-toast-leave-active {
  transition: opacity 0.25s ease;
}

.link-toast-enter-from,
.link-toast-leave-to {
  opacity: 0;
}
</style>
