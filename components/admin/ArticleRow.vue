<template>
  <article class="article-row">
    <img
      v-if="article.image"
      :src="article.image"
      :alt="article.title"
      class="article-thumb"
      loading="lazy"
      width="48"
      height="48"
    />
    <div v-else class="article-thumb article-thumb--empty" aria-hidden="true">📄</div>

    <div class="article-main">
      <div class="article-top">
        <h3 class="article-title" dir="auto">{{ article.title || article.slug }}</h3>
        <span class="locale-pill" :class="`locale-pill--${article.locale}`">
          {{ localeLabel }}
        </span>
      </div>
      <p v-if="article.description" class="article-description" dir="auto">
        {{ article.description }}
      </p>
      <div class="article-sub">
        <code class="article-slug" dir="ltr">{{ article.slug }}</code>
        <span v-if="article.date" class="article-date">{{ formattedDate }}</span>
      </div>
    </div>

    <div class="article-actions">
      <button type="button" class="row-btn" title="Edit in Studio" @click="edit">
        ✏️ تحرير
      </button>
      <button type="button" class="row-btn" title="View live article" @click="visit">
        🌐 زيارة
      </button>
      <button
        type="button"
        class="row-btn row-btn--danger"
        title="Move to trash"
        @click="emit('delete')"
      >
        🗑️
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

function edit(): void {
  navigateTo({
    path: '/admin/editor',
    query: { locale: props.article.locale, slug: props.article.slug },
  })
}

function visit(): void {
  if (typeof window === 'undefined') return
  window.open(`/${props.article.locale}/blog/${props.article.slug}`, '_blank', 'noopener')
}

const localeLabel = computed(() => {
  if (props.article.locale === 'ar') return 'العربية'
  if (props.article.locale === 'fr') return 'Français'
  return 'English'
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
.article-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.1rem;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.article-row:hover {
  transform: translateY(-2px);
  border-color: rgba(201, 168, 124, 0.45);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
}

.article-thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.article-thumb--empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  background: rgba(255, 255, 255, 0.05);
}

.article-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.article-top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.article-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.locale-pill {
  flex-shrink: 0;
  padding: 0.15rem 0.6rem;
  border-radius: 60px;
  font-size: 0.68rem;
  font-weight: 600;
}

.locale-pill--ar {
  background: rgba(52, 211, 153, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.45);
  color: #a7f3d0;
}

.locale-pill--fr {
  background: rgba(96, 165, 250, 0.14);
  border: 1px solid rgba(96, 165, 250, 0.45);
  color: #bfdbfe;
}

.locale-pill--en {
  background: rgba(192, 132, 252, 0.14);
  border: 1px solid rgba(192, 132, 252, 0.45);
  color: #ddd6fe;
}

.article-description {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-sub {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.article-slug {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.72rem;
  color: var(--accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-date {
  font-size: 0.72rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.article-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.row-btn {
  padding: 0.45rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.row-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.row-btn--danger:hover {
  background: rgba(251, 113, 133, 0.15);
  border-color: rgba(251, 113, 133, 0.5);
}

@media (max-width: 640px) {
  .article-row {
    flex-wrap: wrap;
  }

  .article-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
