<template>
  <article class="article-row admin-card">
    <img
      v-if="article.image"
      :src="article.image"
      :alt="article.title"
      class="article-thumb"
      loading="lazy"
      width="56"
      height="56"
    />
    <div v-else class="article-thumb article-thumb--empty" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
    </div>

    <div class="article-main">
      <div class="article-top">
        <h3 class="article-title" dir="auto">{{ article.title || article.slug }}</h3>
        <span class="locale-pill" :class="`locale-pill--${article.locale}`">
          {{ localeLabel }}
        </span>
        <span class="status-badge">
          <span class="status-dot" aria-hidden="true"></span>
          Live
        </span>
      </div>
      <p v-if="article.description" class="article-description article-secondary" dir="auto">
        {{ article.description }}
      </p>
      <div class="article-sub">
        <code class="article-slug" dir="ltr">/{{ article.locale }}/blog/{{ article.slug }}</code>
        <span v-if="article.date" class="article-date article-secondary">{{ formattedDate }}</span>
      </div>
    </div>

    <div class="article-actions">
      <button type="button" class="row-btn" title="Edit in Studio" :aria-label="`Edit ${article.slug} in Studio`" @click="edit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
        <span class="btn-text">Edit</span>
      </button>
      <button type="button" class="row-btn" title="View live article" :aria-label="`View ${article.slug} live`" @click="visit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
        <span class="btn-text">View</span>
      </button>
      <button
        type="button"
        class="row-btn"
        :class="{ 'row-btn--copied': copied }"
        title="Copy URL"
        :aria-label="`Copy URL for ${article.slug}`"
        @click="copyUrl"
      >
        <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
        <span class="btn-text">{{ copied ? 'Copied!' : 'Copy' }}</span>
      </button>
      <button
        type="button"
        class="row-btn row-btn--icon row-btn--danger"
        title="Move to trash"
        :aria-label="`Delete ${article.slug}`"
        @click="emit('delete')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
export interface DashboardArticle {
  title: string
  slug: string
  locale: string
  date: string
  image: string
  description: string
}

const props = defineProps<{
  article: DashboardArticle
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

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
  const path = publicPath()
  const absolute = `${window.location.origin}${path}`
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

const localeLabel = computed(() => {
  if (props.article.locale === 'ar') return 'AR'
  if (props.article.locale === 'fr') return 'FR'
  return 'EN'
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
</script>

<style scoped>
.admin-card,
.article-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02)),
    rgba(10, 14, 26, 0.55);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.article-row:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.4);
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.article-thumb {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.article-thumb--empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
}

.article-thumb--empty svg {
  width: 24px;
  height: 24px;
}

.article-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.article-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex-wrap: wrap;
}

.article-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1 1 auto;
  min-width: 0;
}

.locale-pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0.2rem 0.65rem;
  border-radius: 60px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.locale-pill--ar {
  background: rgba(52, 211, 153, 0.16);
  border: 1px solid rgba(52, 211, 153, 0.5);
  color: #d1fae5;
}

.locale-pill--fr {
  background: rgba(96, 165, 250, 0.16);
  border: 1px solid rgba(96, 165, 250, 0.5);
  color: #dbeafe;
}

.locale-pill--en {
  background: rgba(192, 132, 252, 0.16);
  border: 1px solid rgba(192, 132, 252, 0.5);
  color: #ede9fe;
}

.status-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 28px;
  padding: 0.2rem 0.6rem;
  border-radius: 60px;
  border: 1px solid rgba(52, 211, 153, 0.4);
  background: rgba(52, 211, 153, 0.1);
  color: #d1fae5;
  font-size: 0.7rem;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.9);
}

.article-description {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-sub {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.article-slug {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.74rem;
  color: var(--accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-date {
  font-size: 0.74rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.article-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
}

.row-btn {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.55rem 0.8rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease, color 0.18s ease;
}

.row-btn svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  transition: transform 0.18s ease;
}

.row-btn:hover svg {
  transform: scale(1.15);
}

.row-btn:active svg {
  transform: scale(0.92);
}

.row-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.5);
}

.row-btn:active {
  transform: scale(0.97);
}

.row-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.row-btn--icon {
  padding: 0.55rem;
}

.row-btn--copied {
  border-color: rgba(52, 211, 153, 0.55);
  color: #d1fae5;
}

.row-btn--copied svg {
  transform: scale(1.1);
}

.row-btn--danger:hover {
  background: rgba(251, 113, 133, 0.18);
  border-color: rgba(251, 113, 133, 0.55);
  color: #fecdd3;
}

.btn-text {
  font-size: 0.8rem;
}

/* Mobile <768px: compact touch cards, swipe-friendly actions, 48px targets */
@media (max-width: 767px) {
  .admin-card,
  .article-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
    padding: 0.9rem;
  }

  .article-thumb {
    width: 100%;
    height: 120px;
  }

  .article-thumb--empty {
    height: 64px;
  }

  .article-title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Hide secondary columns on mobile: description + date */
  .article-secondary {
    display: none;
  }

  .article-actions {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.2rem;
  }

  .row-btn {
    min-width: 48px;
    min-height: 48px;
    flex: 1 0 auto;
    scroll-snap-align: start;
  }

  .row-btn svg {
    width: 19px;
    height: 19px;
  }

  .row-btn--icon {
    flex: 0 0 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-row,
  .row-btn,
  .row-btn svg {
    transition: none;
  }
}
</style>
