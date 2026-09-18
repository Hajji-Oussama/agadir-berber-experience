<template>
  <div
    v-if="loading"
    class="exp-grid"
    aria-busy="true"
    aria-label="Loading experiences"
  >
    <div v-for="n in 6" :key="n" class="exp-skeleton"></div>
  </div>

  <div v-else-if="error" class="dash-empty admin-card" role="alert">
    <h2 class="empty-title">Could not load experiences</h2>
    <p class="empty-text">{{ error }}</p>
    <button type="button" class="empty-reset" @click="emit('retry')">
      <AdminIcon name="refresh" :size="16" />
      <span>Retry</span>
    </button>
  </div>

  <div v-else-if="items.length === 0" class="dash-empty admin-card">
    <h2 class="empty-title">No tours found</h2>
    <p class="empty-text">No experiences match your search. Try a different keyword.</p>
    <button type="button" class="empty-reset" @click="emit('clear-search')">
      Clear search
    </button>
  </div>

  <div v-else class="exp-grid">
    <AdminExperienceCard
      v-for="exp in items"
      :key="`exp-${exp.slug}`"
      :exp="exp"
      :swapping="swappingSlug === exp.slug"
      @edit="(slug, locale) => emit('edit', slug, locale)"
      @view="(item) => emit('view', item)"
      @swap="(item, locale) => emit('swap', item, locale)"
      @copy="(item) => emit('copy', item)"
    />
  </div>
</template>

<script setup lang="ts">
import type { StudioLocale } from '~/composables/admin/useStudio'
import type { ExperienceCatalogItem } from '~/composables/admin/experienceCatalog'

withDefaults(
  defineProps<{
    items?: ExperienceCatalogItem[]
    loading?: boolean
    error?: string | null
    swappingSlug?: string | null
  }>(),
  {
    items: () => [],
    loading: false,
    error: null,
    swappingSlug: null,
  }
)

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'clear-search'): void
  (e: 'edit', slug: string, locale: StudioLocale): void
  (e: 'view', exp: ExperienceCatalogItem): void
  (e: 'swap', exp: ExperienceCatalogItem, locale: StudioLocale): void
  (e: 'copy', exp: ExperienceCatalogItem): void
}>()
</script>

<style scoped>
.exp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1rem;
}

@media (max-width: 767px) {
  .exp-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.exp-skeleton {
  min-height: 340px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
  background-size: 200% 100%;
  animation: exp-shimmer 1.4s ease-in-out infinite;
}

@keyframes exp-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.dash-empty {
  padding: 3.5rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02)),
    rgba(10, 14, 26, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.empty-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.3rem;
  color: var(--text-primary);
}

.empty-text {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
  max-width: 420px;
}

.empty-reset {
  margin-top: 0.6rem;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.3rem;
  border-radius: 60px;
  border: 1px solid rgba(var(--accent-rgb, 201, 168, 124), 0.55);
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.14);
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease;
}

.empty-reset:hover {
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.22);
}

.empty-reset:active {
  transform: scale(0.97);
}

.empty-reset:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .exp-skeleton,
  .empty-reset {
    animation: none;
    transition: none;
  }
}
</style>
