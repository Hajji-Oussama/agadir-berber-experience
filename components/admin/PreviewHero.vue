<template>
  <div class="preview-hero" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="preview-hero-banner">
      <img
        v-if="image"
        :src="image"
        :alt="title"
        class="preview-hero-image"
        loading="lazy"
      />
      <div v-else class="preview-hero-placeholder">
        <span>🖼️ No featured image yet / لا توجد صورة بعد</span>
      </div>
    </div>

    <div class="preview-hero-badges">
      <span class="preview-hero-category">{{ category }}</span>
      <span v-if="formattedDate" class="preview-hero-date">{{ formattedDate }}</span>
      <span class="preview-hero-author">{{ author }}</span>
    </div>

    <h1 class="preview-hero-title">{{ title || 'Untitled' }}</h1>
    <p v-if="description" class="preview-hero-lead">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import type { StudioLocale } from '~/composables/admin/useStudio'

const props = withDefaults(
  defineProps<{
    metadata?: Record<string, unknown>
    locale?: StudioLocale
  }>(),
  {
    metadata: () => ({}),
    locale: 'ar',
  }
)

const title = computed(() => String(props.metadata?.title ?? ''))
const description = computed(() => String(props.metadata?.description ?? ''))
const image = computed(() => String(props.metadata?.image ?? ''))
const category = computed(() => String(props.metadata?.category ?? 'Blog'))
const author = computed(
  () => String(props.metadata?.author ?? '') || 'Agadir Berbère Team'
)

const formattedDate = computed(() => {
  const raw = String(props.metadata?.date ?? '')
  if (!raw) return ''
  const parsed = new Date(`${raw}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return raw
  const tag = props.locale === 'ar' ? 'ar-MA' : props.locale === 'fr' ? 'fr-FR' : 'en-US'
  return parsed.toLocaleDateString(tag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
})
</script>

<style scoped>
.preview-hero {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1.5rem;
}

.preview-hero-banner {
  aspect-ratio: 21 / 9;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.3);
}

.preview-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.preview-hero-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 0.78rem;
}

.preview-hero-category {
  padding: 0.25rem 0.9rem;
  border-radius: 60px;
  background: rgba(201, 168, 124, 0.14);
  border: 1px solid rgba(201, 168, 124, 0.45);
  color: var(--accent);
  font-weight: 600;
}

.preview-hero-date,
.preview-hero-author {
  color: var(--text-secondary);
}

.preview-hero-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
}

.preview-hero-lead {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.02rem;
  font-weight: 300;
  line-height: 1.8;
}
</style>
