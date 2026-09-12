<template>
  <header class="studio-header">
    <div class="header-group header-group--content">
      <span class="brand-badge">CMS Studio</span>
      <NuxtLink to="/admin/" class="dashboard-btn" title="قائمة المقالات / Dashboard">
        📋 <span class="dashboard-label">قائمة المقالات</span>
      </NuxtLink>
      <AdminArticleSelector
        :articles="articles"
        :active-locale="activeLocale"
        :active-slug="activeSlug"
        :dirty="dirty"
        @select="(locale, slug) => emit('select', locale, slug)"
      />
      <button
        type="button"
        class="new-article-btn"
        title="مقال جديد / New Article"
        @click="isNewArticleOpen = true"
      >
        <span aria-hidden="true">➕</span>
        <span class="new-article-label">مقال جديد</span>
      </button>
    </div>

    <AdminNewArticleModal
      :is-open="isNewArticleOpen"
      :initial-locale="activeLocale"
      @close="isNewArticleOpen = false"
      @create="(payload) => emit('create-draft', payload.locale, payload.title, payload.slug)"
    />

    <div class="header-group header-group--modes" role="group" aria-label="Workspace modes">
      <button
        type="button"
        class="mode-btn"
        :class="{ 'mode-btn--active': viewMode === 'editor' }"
        @click="emit('change-mode', 'editor')"
        title="Editor only (Alt+1)"
      >
        محرر <kbd>Alt+1</kbd>
      </button>
      <button
        type="button"
        class="mode-btn"
        :class="{ 'mode-btn--active': viewMode === 'split' }"
        @click="emit('change-mode', 'split')"
        title="Split view (Alt+2)"
      >
        50/50 <kbd>Alt+2</kbd>
      </button>
      <button
        type="button"
        class="mode-btn"
        :class="{ 'mode-btn--active': viewMode === 'preview' }"
        @click="emit('change-mode', 'preview')"
        title="Preview only (Alt+3)"
      >
        معاينة <kbd>Alt+3</kbd>
      </button>
      <span class="group-sep"></span>
      <button
        type="button"
        class="mode-btn mode-btn--zen"
        title="وضع التركيز / Zen Mode (Alt+Z)"
        @click="emit('toggle-zen')"
      >
        🧘 تركيز
      </button>
    </div>

    <div class="header-group header-group--actions">
      <span v-if="readingTime" class="reading-pill" title="Estimated reading time">
        {{ readingTime }}
      </span>
      <AdminStatusBadge :status="saveStatus" :error-message="errorMessage" />
      <button
        type="button"
        class="save-btn"
        :disabled="saveStatus === 'saving'"
        @click="emit('save')"
        title="Save article (Ctrl+S)"
      >
        حفظ <kbd>Ctrl+S</kbd>
      </button>
      <button
        type="button"
        class="publish-btn"
        @click="emit('publish')"
        title="Publish article to live site"
      >
        🚀 نشر
      </button>
      <button
        type="button"
        class="logout-btn"
        title="Lock studio / تسجيل الخروج"
        @click="emit('logout')"
      >
        🔒
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import type {
  SaveStatus,
  StudioArticleListItem,
  StudioLocale,
  ViewMode,
} from '~/composables/admin/useStudio'

withDefaults(
  defineProps<{
    articles?: StudioArticleListItem[]
    activeLocale?: StudioLocale
    activeSlug?: string
    dirty?: boolean
    viewMode?: ViewMode
    saveStatus?: SaveStatus
    errorMessage?: string | null
    readingTime?: string
  }>(),
  {
    articles: () => [],
    activeLocale: 'ar',
    activeSlug: '',
    dirty: false,
    viewMode: 'split',
    saveStatus: 'saved',
    errorMessage: null,
    readingTime: '',
  }
)

const emit = defineEmits<{
  (e: 'select', locale: StudioLocale, slug: string): void
  (e: 'change-mode', mode: ViewMode): void
  (e: 'save'): void
  (e: 'publish'): void
  (e: 'toggle-zen'): void
  (e: 'logout'): void
  (e: 'create-draft', locale: StudioLocale, title: string, slug: string): void
}>()

const isNewArticleOpen = ref(false)
</script>

<style scoped>
.studio-header {
  height: 68px;
  width: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(9, 9, 11, 0.8);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  z-index: 30;
  user-select: none;
}

@media (min-width: 1024px) {
  .studio-header {
    padding: 0 1.5rem;
  }
}

.header-group {
  display: flex;
  align-items: center;
  min-width: 0;
}

.header-group--content {
  gap: 0.5rem;
  flex: 1 1 0;
}

.header-group--modes {
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  flex-shrink: 0;
}

.header-group--actions {
  gap: 0.5rem;
  flex-shrink: 0;
}

.brand-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .brand-badge {
    display: none;
  }
}

.dashboard-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.45rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s ease;
}

.dashboard-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 767px) {
  .dashboard-btn .dashboard-label {
    display: none;
  }
}

.new-article-btn {
  flex-shrink: 0;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(52, 211, 153, 0.3);
  background: rgba(5, 150, 105, 0.2);
  color: #6ee7b7;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease;
}

.new-article-btn:hover {
  background: rgba(5, 150, 105, 0.3);
}

.mode-btn {
  height: 2rem;
  padding: 0 0.625rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  color: #fff;
}

.mode-btn--active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.mode-btn--zen {
  border: 1px dashed rgba(201, 168, 124, 0.4);
}

.mode-btn kbd,
.save-btn kbd {
  margin-left: 0.4rem;
  padding: 0.1rem 0.35rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  font-size: 0.65rem;
  font-family: inherit;
}

@media (max-width: 1279px) {
  .mode-btn kbd,
  .save-btn kbd {
    display: none;
  }
}

.group-sep {
  width: 1px;
  align-self: stretch;
  background: var(--glass-border);
  margin: 0.25rem 0;
}

.reading-pill {
  flex-shrink: 0;
  display: none;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  white-space: nowrap;
}

@media (min-width: 1024px) {
  .reading-pill {
    display: inline-flex;
  }
}

.save-btn {
  height: 2.25rem;
  padding: 0 0.875rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #27272a;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  transition: background 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background: #3f3f46;
}

.save-btn:disabled {
  opacity: 0.55;
  cursor: wait;
}

.publish-btn {
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(to right, #f59e0b, #d97706);
  color: #09090b;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2);
  transition: all 0.2s ease;
}

.publish-btn:hover {
  background: linear-gradient(to right, #fbbf24, #f59e0b);
}

.logout-btn {
  flex-shrink: 0;
  height: 2.25rem;
  width: 2.25rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

@media (max-width: 767px) {
  .header-group--modes {
    display: none;
  }

  .header-group--actions .save-btn,
  .header-group--actions .publish-btn,
  .header-group--actions .reading-pill {
    display: none;
  }

  .new-article-label {
    display: none;
  }

  .new-article-btn {
    padding: 0 0.6rem;
  }
}
</style>
