<template>
  <div class="dashboard" dir="ltr">
    <header class="dash-topbar">
      <span class="dash-brand">📋 CMS Studio Dashboard</span>
      <input
        v-model="search"
        type="text"
        class="dash-search"
        dir="auto"
        placeholder="Search title or slug… / بحث…"
        @input="onSearchInput"
      />
      <button type="button" class="dash-new" @click="isNewArticleOpen = true">
        ➕ مقال جديد
      </button>
      <button type="button" class="dash-logout" title="Lock studio / تسجيل الخروج" @click="logout">
        🔒
      </button>
    </header>

    <AdminNewArticleModal
      :is-open="isNewArticleOpen"
      initial-locale="ar"
      @close="isNewArticleOpen = false"
      @create="onCreateArticle"
    />

    <section class="dash-metrics">
      <div class="metric-card">
        <span class="metric-value">{{ counts.total }}</span>
        <span class="metric-label">Total Articles / المجموع</span>
      </div>
      <div class="metric-card metric-card--ar">
        <span class="metric-value">{{ counts.ar }}</span>
        <span class="metric-label">العربية</span>
      </div>
      <div class="metric-card metric-card--fr">
        <span class="metric-value">{{ counts.fr }}</span>
        <span class="metric-label">Français</span>
      </div>
      <div class="metric-card metric-card--en">
        <span class="metric-value">{{ counts.en }}</span>
        <span class="metric-label">English</span>
      </div>
    </section>

    <nav class="dash-tabs" aria-label="Locale filter">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        type="button"
        class="dash-tab"
        :class="{ 'dash-tab--active': localeFilter === tab.value }"
        @click="setLocaleFilter(tab.value)"
      >
        {{ tabLabel(tab.value) }}
      </button>
    </nav>

    <main class="dash-list">
      <div v-if="loading" class="dash-grid">
        <div v-for="n in 5" :key="n" class="row-skeleton"></div>
      </div>
      <div v-else-if="items.length === 0" class="dash-empty">
        <div class="dash-empty-icon">📭</div>
        <p>لا توجد مقالات مطابقة للبحث</p>
      </div>
      <div v-else class="dash-grid">
        <AdminArticleRow
          v-for="item in items"
          :key="`${item.locale}|||${item.slug}`"
          :article="item"
          @delete="openDelete(item)"
        />
      </div>
    </main>

    <footer v-if="totalPages > 0" class="dash-pagination">
      <span class="page-info" dir="auto">
        عرض {{ rangeStart }}-{{ rangeEnd }} من أصل {{ total }} مقال
      </span>
      <div class="page-controls">
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          السابق / Previous
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="page-btn page-num"
          :class="{ 'page-num--active': page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          التالي / Next
        </button>
      </div>
    </footer>

    <AdminDeleteConfirmModal
      :is-open="deleteTarget !== null"
      :title="deleteTarget?.title ?? ''"
      :locale="deleteTarget?.locale ?? ''"
      :slug="deleteTarget?.slug ?? ''"
      @close="deleteTarget = null"
      @deleted="onDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import type { StudioLocale } from '~/composables/admin/useStudio'

definePageMeta({
  layout: 'admin',
})

defineI18nRoute(false)

useHead({
  title: 'CMS Dashboard — Agadir Berbère Expérience',
})

type LocaleFilter = 'all' | StudioLocale

interface DashboardItem {
  title: string
  slug: string
  locale: string
  date: string
  image: string
  description: string
}

const adminAuth = inject<{
  isAuthenticated: Ref<boolean>
  setAuthenticated: (value: boolean) => void
}>('admin-auth', {
  isAuthenticated: ref(false),
  setAuthenticated: () => {},
})

const items = ref<DashboardItem[]>([])
const total = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const limit = 10
const counts = ref({ total: 0, ar: 0, en: 0, fr: 0 })
const loading = ref(true)
const search = ref('')
const localeFilter = ref<LocaleFilter>('all')
const isNewArticleOpen = ref(false)
const deleteTarget = ref<DashboardItem | null>(null)

let searchTimer: ReturnType<typeof setTimeout> | null = null

const filterTabs: { value: LocaleFilter; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'ar', label: 'العربية' },
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
]

const tabLabel = (value: LocaleFilter): string => {
  const base = filterTabs.find((t) => t.value === value)?.label ?? value
  const count = value === 'all' ? counts.value.total : counts.value[value] ?? 0
  return `${base} (${count})`
}

const rangeStart = computed(() =>
  total.value === 0 ? 0 : (currentPage.value - 1) * limit + 1
)
const rangeEnd = computed(() =>
  Math.min(total.value, currentPage.value * limit)
)

const visiblePages = computed(() => {
  const pages: number[] = []
  const totalP = totalPages.value
  const current = currentPage.value
  const end = Math.min(totalP, Math.max(7, current + 3))
  const start = Math.max(1, end - 6)
  for (let p = start; p <= Math.min(totalP, start + 6); p++) pages.push(p)
  return pages
})

async function fetchPage(page: number): Promise<void> {
  loading.value = true
  try {
    const res = await $fetch<{
      success: boolean
      data?: {
        items?: DashboardItem[]
        total?: number
        totalPages?: number
        currentPage?: number
        counts?: { total: number; ar: number; en: number; fr: number }
      }
    }>('/api/admin/articles', {
      query: {
        page,
        limit,
        locale: localeFilter.value,
        search: search.value.trim(),
      },
    })
    items.value = Array.isArray(res?.data?.items) ? res.data.items : []
    total.value = res?.data?.total ?? 0
    totalPages.value = Math.max(1, res?.data?.totalPages ?? 1)
    currentPage.value = res?.data?.currentPage ?? page
    if (res?.data?.counts) counts.value = res.data.counts
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

function goToPage(page: number): void {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  void fetchPage(page)
}

function setLocaleFilter(value: LocaleFilter): void {
  if (localeFilter.value === value) return
  localeFilter.value = value
  void fetchPage(1)
}

function onSearchInput(): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void fetchPage(1)
  }, 300)
}

function openDelete(item: DashboardItem): void {
  deleteTarget.value = item
}

function onDeleted(): void {
  deleteTarget.value = null
  // The current page may now be empty; clamp by refetching page 1 when needed.
  const targetPage = items.value.length <= 1 && currentPage.value > 1 ? currentPage.value - 1 : 1
  void fetchPage(targetPage)
}

function onCreateArticle(payload: { locale: StudioLocale; title: string; slug: string }): void {
  isNewArticleOpen.value = false
  navigateTo({
    path: '/admin/editor',
    query: { locale: payload.locale, slug: payload.slug, draft: payload.title },
  })
}

async function logout(): Promise<void> {
  try {
    await $fetch('/api/admin/auth/logout', { method: 'POST' })
  } catch {
    // Best effort.
  } finally {
    adminAuth.setAuthenticated(false)
  }
}

watch(
  () => adminAuth.isAuthenticated.value,
  (authenticated) => {
    if (authenticated) void fetchPage(1)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-gradient);
  color: var(--text-primary);
}

.dash-topbar {
  height: 72px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.25rem;
  background: rgba(10, 14, 26, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 20;
}

.dash-brand {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  color: var(--accent);
  white-space: nowrap;
}

.dash-search {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 420px;
  padding: 0.55rem 0.9rem;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-primary);
  font-size: 0.85rem;
}

.dash-search:focus {
  outline: none;
  border-color: var(--accent);
}

.dash-new {
  flex-shrink: 0;
  padding: 0.55rem 1.1rem;
  border-radius: 60px;
  border: 1px solid rgba(52, 211, 153, 0.5);
  background: rgba(52, 211, 153, 0.12);
  color: #a7f3d0;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.dash-logout {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  font-size: 1rem;
  cursor: pointer;
}

.dash-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 1.25rem 1.25rem 0;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 1rem 0.5rem;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.04);
}

.metric-value {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.metric-label {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.metric-card--ar .metric-value {
  color: #a7f3d0;
}

.metric-card--fr .metric-value {
  color: #bfdbfe;
}

.metric-card--en .metric-value {
  color: #ddd6fe;
}

.dash-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem 0;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.dash-tab {
  padding: 0.45rem 1rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  cursor: pointer;
}

.dash-tab--active {
  background: rgba(201, 168, 124, 0.16);
  border-color: rgba(201, 168, 124, 0.5);
  color: var(--accent);
  font-weight: 600;
}

.dash-list {
  flex: 1 1 auto;
  padding: 1rem 1.25rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.dash-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.row-skeleton {
  height: 84px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.04));
  background-size: 200% 100%;
  animation: dash-shimmer 1.4s ease-in-out infinite;
}

@keyframes dash-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.dash-empty {
  padding: 4rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.dash-empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.dash-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem 1.5rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.page-info {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.page-btn {
  padding: 0.45rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 0.8rem;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-num {
  min-width: 38px;
  padding: 0.45rem 0.5rem;
}

.page-num--active {
  background: rgba(201, 168, 124, 0.2);
  border-color: rgba(201, 168, 124, 0.55);
  color: var(--accent);
  font-weight: 700;
}

@media (max-width: 640px) {
  .dash-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dash-brand {
    display: none;
  }
}
</style>
