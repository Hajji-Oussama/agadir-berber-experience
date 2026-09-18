<template>
  <article
    class="article-card"
    :aria-labelledby="`article-title-${article.locale}-${article.slug}`"
  >
    <!-- A. Header: cover + floating badges (never mixed with actions) -->
    <div class="article-cover">
      <img
        v-if="article.image"
        :src="article.image"
        :alt="article.title || article.slug"
        class="article-cover-img"
        loading="lazy"
        width="400"
        height="225"
      />
      <div v-else class="article-cover-fallback" aria-hidden="true">
        <AdminIcon name="file-text" :size="40" />
      </div>
      <span class="article-locale-pill" :class="`article-locale-pill--${article.locale}`">
        <span aria-hidden="true">{{ localeFlag }}</span>
        <span>{{ localeLabel }}</span>
      </span>
      <span class="article-status-badge">
        <span class="status-dot" aria-hidden="true"></span>
        Live
      </span>
    </div>

    <!-- B. Body: typography + metadata -->
    <div class="article-card-body">
      <h3
        :id="`article-title-${article.locale}-${article.slug}`"
        class="article-card-title"
        dir="auto"
      >
        {{ article.title || article.slug }}
      </h3>
      <code class="article-slug" dir="ltr">/{{ article.locale }}/blog/{{ article.slug }}</code>
      <p class="article-meta-strip">
        <span v-if="formattedDate">{{ formattedDate }}</span>
        <span v-if="formattedDate" class="meta-sep" aria-hidden="true">•</span>
        <span>{{ readingMeta }}</span>
      </p>
    </div>

    <!-- C. Footer: dedicated action bar -->
    <div class="article-card-actions">
      <button
        type="button"
        class="article-action article-action--primary"
        :aria-label="`Edit ${article.slug} in Studio`"
        @click="edit"
      >
        <AdminIcon name="pencil" :size="18" />
        <span>Edit</span>
      </button>
      <div class="article-action-group" role="group" :aria-label="`More actions for ${article.slug}`">
        <button
          type="button"
          class="article-action article-action--icon"
          title="View live"
          :aria-label="`View ${article.slug} live`"
          @click="visit"
        >
          <AdminIcon name="external" :size="18" />
        </button>
        <button
          type="button"
          class="article-action article-action--icon"
          title="Copy link"
          :aria-label="`Copy link for ${article.slug}`"
          @click="copyUrl"
        >
          <AdminIcon :name="copied ? 'check' : 'copy'" :size="18" />
        </button>
        <button
          type="button"
          class="article-action article-action--icon article-action--danger"
          title="Move to trash"
          :aria-label="`Delete ${article.slug}`"
          @click="emit('delete')"
        >
          <AdminIcon name="trash" :size="18" />
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
export interface ArticleCardItem {
  title: string
  slug: string
  locale: string
  date: string
  image: string
  description: string
}

const props = defineProps<{
  article: ArticleCardItem
}>()

const emit = defineEmits<{
  (e: 'delete'): void
}>()

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

const localeLabel = computed(() => {
  if (props.article.locale === 'ar') return 'AR'
  if (props.article.locale === 'fr') return 'FR'
  return 'EN'
})

const localeFlag = computed(() => {
  if (props.article.locale === 'ar') return '🇸🇦'
  if (props.article.locale === 'fr') return '🇫🇷'
  return '🇬🇧'
})

const formattedDate = computed(() => {
  if (!props.article.date) return ''
  const parsed = new Date(`${props.article.date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return props.article.date
  const tag =
    props.article.locale === 'ar' ? 'ar-MA' : props.article.locale === 'fr' ? 'fr-FR' : 'en-US'
  return parsed.toLocaleDateString(tag, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
})

const readingMeta = computed(() => {
  const text = `${props.article.title ?? ''} ${props.article.description ?? ''}`.trim()
  const words = text ? text.split(/\s+/).length : 0
  const mins = Math.max(1, Math.ceil(words / 200))
  return `${words} words · ${mins} min read`
})

function edit(): void {
  navigateTo({
    path: '/admin/editor',
    query: { locale: props.article.locale, slug: props.article.slug },
  })
}

function publicPath(): string {
  return `/${props.article.locale}/blog/${props.article.slug}`
}

function visit(): void {
  if (!import.meta.client) return
  window.open(publicPath(), '_blank', 'noopener')
}

async function copyUrl(): Promise<void> {
  if (!import.meta.client) return
  const absolute = `${window.location.origin}${publicPath()}`
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(absolute)
    } else {
      const ta = document.createElement('textarea')
      ta.value = absolute
      ta.setAttribute('readonly', '')
      ta.style.position = 'absolute'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    copied.value = false
  }
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<style scoped>
.article-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02)),
    rgba(10, 14, 26, 0.55);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.article-card:hover {
  transform: translateY(-3px);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.45);
}

/* A. Header */
.article-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.35);
  flex-shrink: 0;
}

.article-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.article-cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(135deg, rgba(var(--accent-rgb, 201, 168, 124), 0.22), rgba(10, 14, 26, 0.6));
  color: var(--accent);
}

.article-locale-pill {
  position: absolute;
  top: 0.7rem;
  inset-inline-start: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-height: 28px;
  padding: 0.2rem 0.65rem;
  border-radius: 60px;
  background: rgba(10, 14, 26, 0.78);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.article-locale-pill--ar {
  border: 1px solid rgba(52, 211, 153, 0.55);
  color: #d1fae5;
}

.article-locale-pill--fr {
  border: 1px solid rgba(96, 165, 250, 0.55);
  color: #dbeafe;
}

.article-locale-pill--en {
  border: 1px solid rgba(192, 132, 252, 0.55);
  color: #ede9fe;
}

.article-status-badge {
  position: absolute;
  top: 0.7rem;
  inset-inline-end: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 28px;
  padding: 0.2rem 0.65rem;
  border-radius: 60px;
  border: 1px solid rgba(52, 211, 153, 0.5);
  background: rgba(10, 14, 26, 0.78);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #d1fae5;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.9);
  flex-shrink: 0;
}

/* B. Body */
.article-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.1rem 0.6rem;
  min-width: 0;
  flex: 1 1 auto;
}

.article-card-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6rem;
}

.article-slug {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-meta-strip {
  margin: 0.15rem 0 0;
  font-size: 0.78rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-sep {
  margin: 0 0.35rem;
  opacity: 0.6;
}

/* C. Footer action bar */
.article-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 0.5rem;
  margin-top: auto;
  padding: 0.75rem 1.1rem 1.1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.article-action {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
}

.article-action:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.5);
}

.article-action:hover:not(:disabled) .admin-icon {
  transform: scale(1.15);
}

.article-action:active:not(:disabled) {
  transform: scale(0.96);
}

.article-action:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.article-action--primary {
  flex: 1 1 auto;
  padding: 0.55rem 1rem;
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.18);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.55);
  color: var(--accent);
  font-weight: 700;
  min-width: 0;
}

.article-action--primary:hover:not(:disabled) {
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.28);
}

.article-action-group {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.article-action--icon {
  width: 48px;
  min-width: 48px;
  padding: 0.55rem;
}

.article-action--danger:hover:not(:disabled) {
  background: rgba(251, 113, 133, 0.18);
  border-color: rgba(251, 113, 133, 0.55);
  color: #fecdd3;
}

/* Icons never squash inside any flex row of this card. */
.article-card .admin-icon {
  flex-shrink: 0;
  min-width: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .article-card,
  .article-action {
    animation: none;
    transition: none;
  }
}
</style>
