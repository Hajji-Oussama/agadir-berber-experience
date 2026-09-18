<template>
  <div class="dashboard" dir="ltr">
    <header class="dash-topbar">
      <span class="dash-brand">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
        <span>CMS Studio</span>
      </span>
      <button type="button" class="dash-logout" title="Lock studio" aria-label="Lock studio" @click="logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
      </button>
    </header>

    <AdminNewArticleModal
      :is-open="isNewArticleOpen"
      initial-locale="ar"
      @close="isNewArticleOpen = false"
      @create="onCreateArticle"
    />

    <!-- Breadcrumbs: desktop only -->
    <nav class="breadcrumbs only-desktop" aria-label="Breadcrumb">
      <span class="crumb">Studio</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      <span class="crumb crumb--current" aria-current="page">{{ section === 'experiences' ? 'Experiences' : 'Articles' }}</span>
    </nav>

    <!-- Hub header: compact segmented switcher + high-intent CTA -->
    <div class="hub-header">
      <div class="hub-switcher" role="tablist" aria-label="Content section">
        <span class="hub-thumb" :class="{ 'hub-thumb--right': section === 'experiences' }" aria-hidden="true"></span>
        <button
          type="button"
          role="tab"
          class="hub-tab"
          :class="{ 'hub-tab--active': section === 'articles' }"
          :aria-selected="section === 'articles'"
          @click="setSection('articles')"
        >
          <span class="hub-tab-icon" aria-hidden="true"><AdminIcon name="file-text" :size="18" /></span>
          <span>Articles</span>
          <span class="hub-tab-count">{{ counts.total }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="hub-tab"
          :class="{ 'hub-tab--active': section === 'experiences' }"
          :aria-selected="section === 'experiences'"
          @click="setSection('experiences')"
        >
          <span class="hub-tab-icon" aria-hidden="true"><AdminIcon name="compass" :size="18" /></span>
          <span>Experiences</span>
          <span class="hub-tab-count">{{ expItems.length }}</span>
        </button>
      </div>
      <div class="hub-cta">
        <button
          v-if="section === 'articles'"
          type="button"
          class="hub-new"
          @click="isNewArticleOpen = true"
        >
          <AdminIcon name="plus" :size="16" />
          <span>New Article</span>
        </button>
        <span v-else class="hub-status" :class="{ 'hub-status--partial': expFullCoverage < expItems.length }" role="status">
          <AdminIcon name="check" :size="15" />
          <span>{{ expFullCoverage }} of {{ expItems.length }} Active</span>
        </span>
      </div>
    </div>

    <section v-if="section === 'articles'" class="dash-metrics" aria-label="Filter articles by language">
      <button
        type="button"
        class="metric-card"
        :class="{ 'metric-card--active': localeFilter === 'all' }"
        :aria-pressed="localeFilter === 'all'"
        aria-label="Show all languages"
        @click="setLocaleFilter('all')"
      >
        <span class="metric-value">{{ counts.total }}</span>
        <span class="metric-label">All</span>
      </button>
      <button
        type="button"
        class="metric-card metric-card--en"
        :class="{ 'metric-card--active': localeFilter === 'en' }"
        :aria-pressed="localeFilter === 'en'"
        aria-label="Show English articles"
        @click="setLocaleFilter('en')"
      >
        <span class="metric-value">{{ counts.en }}</span>
        <span class="metric-label">🇬🇧 English</span>
      </button>
      <button
        type="button"
        class="metric-card metric-card--fr"
        :class="{ 'metric-card--active': localeFilter === 'fr' }"
        :aria-pressed="localeFilter === 'fr'"
        aria-label="Show French articles"
        @click="setLocaleFilter('fr')"
      >
        <span class="metric-value">{{ counts.fr }}</span>
        <span class="metric-label">🇫🇷 Français</span>
      </button>
      <button
        type="button"
        class="metric-card metric-card--ar"
        :class="{ 'metric-card--active': localeFilter === 'ar' }"
        :aria-pressed="localeFilter === 'ar'"
        aria-label="Show Arabic articles"
        @click="setLocaleFilter('ar')"
      >
        <span class="metric-value">{{ counts.ar }}</span>
        <span class="metric-label">🇸🇦 العربية</span>
      </button>
      <div class="metric-card metric-card--updated metric-secondary">
        <span class="metric-value metric-value--small">{{ lastUpdated }}</span>
        <span class="metric-label">Last Updated</span>
      </div>
    </section>

    <section v-else class="dash-metrics dash-metrics--exp" aria-label="Filter experiences by language">
      <button
        type="button"
        class="metric-card"
        :class="{ 'metric-card--active': expLocaleFilter === 'all' }"
        :aria-pressed="expLocaleFilter === 'all'"
        aria-label="Show all tours"
        @click="setExpLocaleFilter('all')"
      >
        <span class="metric-value">{{ expItems.length }}</span>
        <span class="metric-label">Tours</span>
      </button>
      <button
        type="button"
        class="metric-card metric-card--en"
        :class="{ 'metric-card--active': expLocaleFilter === 'en' }"
        :aria-pressed="expLocaleFilter === 'en'"
        aria-label="Show tours available in English"
        @click="setExpLocaleFilter('en')"
      >
        <span class="metric-value">{{ expLocaleCount('en') }}</span>
        <span class="metric-label">🇬🇧 EN</span>
      </button>
      <button
        type="button"
        class="metric-card metric-card--fr"
        :class="{ 'metric-card--active': expLocaleFilter === 'fr' }"
        :aria-pressed="expLocaleFilter === 'fr'"
        aria-label="Show tours available in French"
        @click="setExpLocaleFilter('fr')"
      >
        <span class="metric-value">{{ expLocaleCount('fr') }}</span>
        <span class="metric-label">🇫🇷 FR</span>
      </button>
      <button
        type="button"
        class="metric-card metric-card--ar"
        :class="{ 'metric-card--active': expLocaleFilter === 'ar' }"
        :aria-pressed="expLocaleFilter === 'ar'"
        aria-label="Show tours available in Arabic"
        @click="setExpLocaleFilter('ar')"
      >
        <span class="metric-value">{{ expLocaleCount('ar') }}</span>
        <span class="metric-label">🇸🇦 AR</span>
      </button>
      <div class="metric-card metric-card--updated metric-secondary">
        <span class="metric-value metric-value--small">{{ expFullCoverage }} / {{ expItems.length }}</span>
        <span class="metric-label">Full Coverage</span>
      </div>
    </section>

    <section v-if="section === 'articles'" class="dash-controls" aria-label="Search, sort and change article density">
      <div class="control-search">
        <label class="visually-hidden" for="admin-search">Search articles by title, slug or description</label>
        <span class="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        </span>
        <input
          id="admin-search"
          v-model="search"
          type="search"
          class="dash-search"
          dir="auto"
          placeholder="Search title, slug, description…"
          autocomplete="off"
          @input="onSearchInput"
        />
        <button
          v-if="search"
          type="button"
          class="search-clear"
          aria-label="Clear search"
          @click="search = ''; onSearchInput()"
        >
          <AdminIcon name="x" :size="15" />
        </button>
      </div>

      <div class="control-sort">
        <label class="sort-label" for="admin-sort">Sort</label>
        <select id="admin-sort" v-model="sortMode" class="sort-select" aria-label="Sort articles">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="az">Title A–Z</option>
        </select>
        <div class="density-toggle" role="group" aria-label="Articles density">
          <button
            type="button"
            class="density-btn"
            :class="{ 'density-btn--active': density === 'table' }"
            :aria-pressed="density === 'table'"
            title="Table view"
            aria-label="Table view"
            @click="setDensity('table')"
          >
            <AdminIcon name="table" :size="16" />
          </button>
          <button
            type="button"
            class="density-btn"
            :class="{ 'density-btn--active': density === 'grid' }"
            :aria-pressed="density === 'grid'"
            title="Grid view"
            aria-label="Grid view"
            @click="setDensity('grid')"
          >
            <AdminIcon name="grid" :size="16" />
          </button>
        </div>
        <span class="result-count" role="status" aria-live="polite">
          {{ filteredSortedItems.length }} of {{ items.length }} shown
        </span>
      </div>
    </section>

    <section v-else class="dash-controls dash-controls--exp" aria-label="Search experiences">
      <div class="control-search">
        <label class="visually-hidden" for="admin-search-exp">Search experiences by title or slug</label>
        <span class="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        </span>
        <input
          id="admin-search-exp"
          v-model="expSearch"
          type="search"
          class="dash-search"
          dir="auto"
          placeholder="Search tours… (quad, buggy, cooking)"
          autocomplete="off"
        />
        <button
          v-if="expSearch"
          type="button"
          class="search-clear"
          aria-label="Clear search"
          @click="expSearch = ''"
        >
          <AdminIcon name="x" :size="15" />
        </button>
      </div>
      <span class="result-count" role="status" aria-live="polite">
        {{ filteredExperiences.length }} of {{ expItems.length }} tours
      </span>
    </section>

    <main v-if="section === 'articles'" class="dash-list">
      <div v-if="loading" class="dash-grid" aria-busy="true" aria-label="Loading articles">
        <div v-for="n in 5" :key="n" class="row-skeleton"></div>
      </div>

      <div v-else-if="filteredSortedItems.length === 0" class="dash-empty admin-card">
        <span class="dash-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
        </span>
        <h2 class="empty-title">No articles found</h2>
        <p class="empty-text">No articles match your search or filter. Try a different keyword or locale.</p>
        <button type="button" class="empty-reset" @click="resetFilters">
          Clear search &amp; filters
        </button>
      </div>

      <!-- Density branches: analytical table (desktop) or touch cards.
        Mobile always renders cards (CSS-gated), so exactly one branch
        is ever visible per viewport. -->
      <template v-else>
        <!-- Desktop >=768px table density -->
        <div v-if="density === 'table'" class="dash-table-wrap only-desktop">
          <table class="dash-table">
            <thead>
              <tr>
                <th scope="col">Article</th>
                <th scope="col">Locale</th>
                <th scope="col">Length</th>
                <th scope="col">Updated</th>
                <th scope="col">Status</th>
                <th scope="col"><span class="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredSortedItems" :key="`row-${item.locale}|||${item.slug}`" class="dash-row">
              <td class="cell-article">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title"
                  class="cell-thumb"
                  loading="lazy"
                  width="44"
                  height="44"
                />
                <span v-else class="cell-thumb cell-thumb--empty" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
                </span>
                <span class="cell-article-text">
                  <strong class="cell-title" dir="auto">{{ item.title || item.slug }}</strong>
                  <code class="cell-slug" dir="ltr">/{{ item.locale }}/blog/{{ item.slug }}</code>
                </span>
              </td>
              <td>
                <span class="locale-pill" :class="`locale-pill--${item.locale}`">{{ localeShort(item.locale) }}</span>
              </td>
              <td class="cell-length">{{ readingMeta(item) }}</td>
              <td class="cell-date">{{ formatDate(item) }}</td>
              <td>
                <span class="status-badge"><span class="status-dot" aria-hidden="true"></span>Live</span>
              </td>
              <td class="cell-actions">
                <button type="button" class="icon-btn" title="Edit in Studio" :aria-label="`Edit ${item.slug}`" @click="editItem(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                </button>
                <button type="button" class="icon-btn" title="View live" :aria-label="`View ${item.slug} live`" @click="visitItem(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                </button>
                <button type="button" class="icon-btn icon-btn--danger" title="Delete" :aria-label="`Delete ${item.slug}`" @click="openDelete(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

        <!-- Grid density (all viewports) -->
        <div v-if="density === 'grid'" class="article-grid">
          <AdminArticleCard
            v-for="item in filteredSortedItems"
            :key="`grid-${item.locale}|||${item.slug}`"
            :article="item"
            @delete="openDelete(item)"
          />
        </div>

      <!-- Mobile fallback: cards when table density is active on desktop -->
        <div v-if="density === 'table'" class="article-grid only-mobile">
          <AdminArticleCard
            v-for="item in filteredSortedItems"
            :key="`card-${item.locale}|||${item.slug}`"
            :article="item"
            @delete="openDelete(item)"
          />
        </div>
      </template>
    </main>

    <!-- Experiences catalog: delegated to ExperienceGrid (single branch,
      no duplication with the articles list above). -->
    <main v-else class="dash-list dash-list--exp" aria-label="Experiences catalog">
      <AdminExperienceGrid
        :items="filteredExperiences"
        :loading="expLoading"
        :error="expError"
        :swapping-slug="swapSlug"
        @retry="fetchExperiences"
        @clear-search="expSearch = ''"
        @edit="editExperience"
        @view="visitExperience"
        @swap="openImageSwap"
        @copy="copyExperienceLink"
      />
    </main>

    <Transition name="publish-toast">
      <div v-if="copyToast" class="copy-toast" role="status">{{ copyToast }}</div>
    </Transition>

    <footer v-if="section === 'articles' && totalPages > 0" class="dash-pagination">
      <span class="page-info" dir="auto">
        Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }} articles
      </span>
      <div class="page-controls">
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage <= 1"
          aria-label="Previous page"
          @click="goToPage(currentPage - 1)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          <span class="only-desktop">Prev</span>
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="page-btn page-num only-desktop"
          :class="{ 'page-num--active': page === currentPage }"
          :aria-current="page === currentPage ? 'page' : undefined"
          :aria-label="`Go to page ${page}`"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span class="page-current only-mobile" aria-live="polite">{{ currentPage }} / {{ totalPages }}</span>
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage >= totalPages"
          aria-label="Next page"
          @click="goToPage(currentPage + 1)"
        >
          <span class="only-desktop">Next</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
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

    <AdminMediaModal
      :is-open="isSwapModalOpen"
      mode="featured"
      @close="isSwapModalOpen = false"
      @select-featured="onSwapFeatured"
      @insert-content="onSwapFeatured"
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
type SortMode = 'date-desc' | 'date-asc' | 'az'

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
const sortMode = ref<SortMode>('date-desc')
const isNewArticleOpen = ref(false)
const deleteTarget = ref<DashboardItem | null>(null)

type Density = 'table' | 'grid'

// Density defaults to table on both server and client (hydration-safe);
// the stored preference is applied after mount.
const density = ref<Density>('table')

function setDensity(next: Density): void {
  if (density.value === next) return
  density.value = next
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('cms_dashboard_density', next)
    }
  } catch {
    // best effort
  }
}

// ---------- Hub switcher: Articles vs Experiences (strictly isolated states) ----------
type HubSection = 'articles' | 'experiences'

import type { ExperienceCatalogItem } from '~/composables/admin/experienceCatalog'
import { primaryExpLocale } from '~/composables/admin/experienceCatalog'

const route = useRoute()

function sectionFromQuery(): HubSection {
  const raw = route.query.section
  const value = Array.isArray(raw) ? raw[0] : raw
  return value === 'experiences' ? 'experiences' : 'articles'
}

const section = ref<HubSection>(sectionFromQuery())

// Experiences state lives in its own refs — never shares arrays with the
// articles list above (zero data duplication by construction).
const expItems = ref<ExperienceCatalogItem[]>([])
const expLoading = ref(false)
const expError = ref<string | null>(null)
const expSearch = ref('')
const expLoaded = ref(false)
let expFetchSeq = 0

// Quick image swap state (experiences only; articles use the editor).
const isSwapModalOpen = ref(false)
const swapTarget = ref<{ slug: string; locale: StudioLocale } | null>(null)
const swapSlug = ref<string | null>(null)

function setSection(next: HubSection): void {
  if (section.value === next) return
  section.value = next
  // Preserve deep-linked params (e.g. locale filters); only swap `section`.
  const { section: _dropped, ...rest } = route.query
  navigateTo(
    {
      path: '/admin',
      query: next === 'experiences' ? { ...rest, section: 'experiences' } : rest,
    },
    { replace: true }
  )
  if (next === 'experiences' && !expLoaded.value) void fetchExperiences()
}

async function fetchExperiences(): Promise<void> {
  const seq = ++expFetchSeq
  expLoading.value = true
  expError.value = null
  try {
    const res = await $fetch<{
      success: boolean
      data?: { items?: ExperienceCatalogItem[] }
      error?: { message?: string }
    }>('/api/admin/experiences')
    // Drop stale responses; reset-assign once, never append.
    if (seq !== expFetchSeq) return
    expItems.value = Array.isArray(res?.data?.items) ? [...res.data.items] : []
    expLoaded.value = true
  } catch (err) {
    if (seq !== expFetchSeq) return
    expItems.value = []
    expError.value = err instanceof Error ? err.message : 'Failed to load experiences.'
  } finally {
    if (seq !== expFetchSeq) return
    expLoading.value = false
  }
}

const filteredExperiences = computed(() => {
  const q = expSearch.value.trim().toLowerCase()
  const locale = expLocaleFilter.value
  let list = expItems.value
  if (locale !== 'all') {
    list = list.filter((exp) => exp.locales?.[locale]?.exists ?? false)
  }
  if (!q) return list
  return list.filter((exp) =>
    `${exp.title ?? ''} ${exp.slug ?? ''}`.toLowerCase().includes(q)
  )
})

function expLocaleCount(locale: StudioLocale): number {
  return expItems.value.filter((exp) => exp.locales?.[locale]?.exists).length
}

const expFullCoverage = computed(
  () => expItems.value.filter((exp) => exp.availability?.length === 3).length
)

function editExperience(slug: string, locale: StudioLocale): void {
  navigateTo({
    path: '/admin/editor',
    query: { type: 'experience', locale, slug },
  })
}

function visitExperience(exp: ExperienceCatalogItem): void {
  if (!import.meta.client) return
  window.open(`/${primaryExpLocale(exp)}/experiences/${exp.slug}`, '_blank', 'noopener')
}

const copyToast = ref<string | null>(null)
let copyToastTimer: ReturnType<typeof setTimeout> | null = null

async function copyExperienceLink(exp: ExperienceCatalogItem): Promise<void> {
  const locale = primaryExpLocale(exp)
  const path = `/${locale}/experiences/${exp.slug}`
  const url =
    import.meta.client && typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}${path}`
      : `https://www.agadirberbereexperience.com${path}`
  let copied = false
  try {
    if (import.meta.client && navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      copied = true
    }
  } catch {
    copied = false
  }
  if (!copied && import.meta.client) {
    try {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      copied = document.execCommand('copy')
      document.body.removeChild(ta)
    } catch {
      copied = false
    }
  }
  copyToast.value = copied ? `Link copied: ${path}` : 'Copy failed — link not copied'
  if (copyToastTimer) clearTimeout(copyToastTimer)
  copyToastTimer = setTimeout(() => {
    copyToast.value = null
  }, 3000)
}

function openImageSwap(exp: ExperienceCatalogItem, locale: StudioLocale): void {
  swapTarget.value = { slug: exp.slug, locale }
  isSwapModalOpen.value = true
}

async function onSwapFeatured(url: string): Promise<void> {
  isSwapModalOpen.value = false
  const target = swapTarget.value
  if (!target || typeof url !== 'string' || !url) return
  swapSlug.value = target.slug
  try {
    const current = await $fetch<{
      success: boolean
      data: { metadata: Record<string, unknown>; rawContent: string }
    }>('/api/admin/article', {
      query: { locale: target.locale, slug: target.slug, type: 'experience' },
    })
    await $fetch('/api/admin/save', {
      method: 'POST',
      body: {
        locale: target.locale,
        slug: target.slug,
        type: 'experience',
        metadata: { ...(current?.data?.metadata ?? {}), image: url },
        rawContent: current?.data?.rawContent ?? '',
      },
    })
    await fetchExperiences()
  } catch {
    expError.value = `Image swap failed for ${target.slug} [${target.locale}].`
  } finally {
    swapSlug.value = null
    swapTarget.value = null
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
let fetchSeq = 0

// Experiences language filter: 'all' or one locale (tours available in it).
const expLocaleFilter = ref<'all' | StudioLocale>('all')

function setExpLocaleFilter(value: 'all' | StudioLocale): void {
  expLocaleFilter.value = value
}

function localeShort(locale: string): string {
  if (locale === 'ar') return 'AR'
  if (locale === 'fr') return 'FR'
  return 'EN'
}

function readingMeta(item: DashboardItem): string {
  const text = `${item.title ?? ''} ${item.description ?? ''}`.trim()
  const words = text ? text.split(/\s+/).length : 0
  const mins = Math.max(1, Math.ceil(words / 200))
  return `${words} words · ${mins} min`
}

function formatDate(item: DashboardItem): string {
  if (!item.date) return '—'
  const parsed = new Date(`${item.date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return item.date
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function editItem(item: DashboardItem): void {
  navigateTo({
    path: '/admin/editor',
    query: { locale: item.locale, slug: item.slug },
  })
}

function visitItem(item: DashboardItem): void {
  if (!import.meta.client) return
  window.open(`/${item.locale}/blog/${item.slug}`, '_blank', 'noopener')
}

const filteredSortedItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  let list = items.value
  if (q) {
    list = list.filter((item) =>
      `${item.title ?? ''} ${item.slug ?? ''} ${item.description ?? ''}`
        .toLowerCase()
        .includes(q)
    )
  }
  const sorted = [...list]
  if (sortMode.value === 'az') {
    sorted.sort((a, b) => (a.title || a.slug).localeCompare(b.title || b.slug))
  } else if (sortMode.value === 'date-asc') {
    sorted.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  } else {
    sorted.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }
  return sorted
})

const lastUpdated = computed(() => {
  if (items.value.length === 0) return '—'
  const latest = [...items.value]
    .map((i) => i.date || '')
    .filter(Boolean)
    .sort()
    .pop()
  if (!latest) return '—'
  const parsed = new Date(`${latest}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return latest
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
})

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
  const seq = ++fetchSeq
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
    // Drop stale responses from rapid filter/search changes so the list
    // is always reset-assigned once, never appended or duplicated.
    if (seq !== fetchSeq) return
    items.value = Array.isArray(res?.data?.items) ? [...res.data.items] : []
    total.value = res?.data?.total ?? 0
    totalPages.value = Math.max(1, res?.data?.totalPages ?? 1)
    currentPage.value = res?.data?.currentPage ?? page
    if (res?.data?.counts) counts.value = res.data.counts
  } catch {
    if (seq !== fetchSeq) return
    items.value = []
  } finally {
    if (seq !== fetchSeq) return
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

function resetFilters(): void {
  search.value = ''
  localeFilter.value = 'all'
  sortMode.value = 'date-desc'
  void fetchPage(1)
}

function openDelete(item: DashboardItem): void {
  deleteTarget.value = item
}

function onDeleted(): void {
  deleteTarget.value = null
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
    if (authenticated) {
      void fetchPage(1)
      // Prefetch the catalog so the Experiences tab badge is live and
      // switching sections is instant. Independent request, isolated state.
      void fetchExperiences()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
  if (copyToastTimer) clearTimeout(copyToastTimer)
})

onMounted(() => {
  // Restore density preference client-side only (SSR renders 'table').
  try {
    const stored = window.localStorage.getItem('cms_dashboard_density')
    if (stored === 'table' || stored === 'grid') density.value = stored
  } catch {
    // best effort
  }
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

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Adaptive visibility: desktop >=768px, mobile <768px.
   Both presentations stay in DOM for CSS-only switching (no JS breakpoints,
   no hydration mismatch). Strict !important guards guarantee only one is
   ever visible. */
.only-mobile {
  display: none !important;
}

@media (max-width: 767px) {
  .only-desktop {
    display: none !important;
  }

  .only-mobile {
    display: block !important;
  }

  div.only-mobile {
    display: block !important;
  }

  span.only-mobile {
    display: inline !important;
  }
}

/* ---------- Topbar: layered glass ---------- */
.dash-topbar {
  min-height: 68px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 1.25rem;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    rgba(10, 14, 26, 0.72);
  backdrop-filter: blur(16px) saturate(1.25);
  -webkit-backdrop-filter: blur(16px) saturate(1.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  z-index: 40;
}

.dash-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  white-space: nowrap;
  margin-right: auto;
}

.dash-brand svg {
  width: 22px;
  height: 22px;
}

.dash-logout {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  font-weight: 600;
}

.dash-logout svg {
  width: 18px;
  height: 18px;
  transition: transform 0.18s ease;
}

.dash-logout:hover svg {
  transform: scale(1.15);
}

.dash-logout {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.dash-logout:focus-visible,
.dash-search:focus-visible,
.hub-tab:focus-visible,
.hub-new:focus-visible,
.metric-card:focus-visible,
.density-btn:focus-visible,
.search-clear:focus-visible,
.sort-select:focus-visible,
.page-btn:focus-visible,
.empty-reset:focus-visible,
.icon-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ---------- Breadcrumbs (desktop only) ---------- */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem 1.25rem 0;
  box-sizing: border-box;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.breadcrumbs svg {
  width: 14px;
  height: 14px;
}

.crumb--current {
  color: var(--text-primary);
  font-weight: 700;
}

/* ---------- Metrics: interactive filter pills (layered glass) ---------- */
.dash-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 1.1rem 1.25rem 0;
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-height: 92px;
  padding: 1rem 0.6rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    rgba(10, 14, 26, 0.5);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Buttons double as filters: reset native button chrome. */
button.metric-card {
  font: inherit;
  color: inherit;
  cursor: pointer;
}

button.metric-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.4);
}

button.metric-card:active {
  transform: scale(0.98);
}

.metric-card--active {
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.65);
  box-shadow:
    0 0 12px rgba(var(--accent-rgb, 201, 168, 124), 0.45),
    0 8px 28px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.metric-card--active .metric-label {
  color: var(--accent);
}

.metric-value {
  font-family: var(--font-heading);
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.metric-value--small {
  font-size: 1.05rem;
}

.metric-label {
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--text-secondary);
}

.metric-card--ar .metric-value {
  color: #d1fae5;
}

.metric-card--fr .metric-value {
  color: #dbeafe;
}

.metric-card--en .metric-value {
  color: #ede9fe;
}

/* ---------- Unified toolbar: search + sort + density, one line ---------- */
.dash-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem 0;
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.control-search {
  position: relative;
  flex: 1 1 380px;
  max-width: 380px;
  min-width: 0;
}

.search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-icon svg {
  width: 18px;
  height: 18px;
}

.dash-search {
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  padding: 0.7rem 1rem 0.7rem 2.6rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.dash-search::placeholder {
  color: var(--text-secondary);
  opacity: 1;
}

.control-search .dash-search {
  padding-inline-end: 2.6rem;
}

.search-clear {
  position: absolute;
  inset-inline-end: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.search-clear:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.control-sort {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-left: auto;
}

.sort-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.sort-select {
  min-height: 44px;
  padding: 0.55rem 0.9rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
}

.sort-select option {
  color: #111;
}

.result-count {
  margin-left: auto;
  font-size: 0.78rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* Density toggle: mini segmented control */
.density-toggle {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.density-btn {
  min-width: 44px;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.7rem;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.density-btn:hover {
  color: var(--text-primary);
}

.density-btn--active {
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.2);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.55);
  color: var(--accent);
}

/* Articles card grid (density) */
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1rem;
}

.article-grid > * {
  min-width: 0;
  height: 100%;
}

/* ---------- List / table / cards ---------- */
.dash-list {
  flex: 1 1 auto;
  padding: 1rem 1.25rem;
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.dash-grid {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.row-skeleton {
  height: 96px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
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

.dash-empty-icon {
  display: inline-flex;
  color: var(--text-secondary);
}

.dash-empty-icon svg {
  width: 44px;
  height: 44px;
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
  min-height: 44px;
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

/* Desktop analytical table */
.dash-table-wrap {
  overflow-x: auto;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
    rgba(10, 14, 26, 0.55);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.dash-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.dash-table thead th {
  text-align: left;
  padding: 0.8rem 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.dash-row {
  transition: background 0.18s ease;
}

.dash-row + .dash-row {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dash-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.dash-table td {
  padding: 0.7rem 1rem;
  vertical-align: middle;
}

.cell-article {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.cell-thumb {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.cell-thumb--empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
}

.cell-thumb--empty svg {
  width: 20px;
  height: 20px;
}

.cell-article-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.cell-title {
  font-size: 0.88rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 340px;
}

.cell-slug {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.72rem;
  color: var(--accent);
}

.cell-date,
.cell-length {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.locale-pill {
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
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.9);
}

.cell-actions {
  white-space: nowrap;
  text-align: right;
}

.icon-btn {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  margin-left: 0.3rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
}

.icon-btn svg {
  width: 17px;
  height: 17px;
  transition: transform 0.18s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.5);
}

.icon-btn:hover svg {
  transform: scale(1.15);
}

.icon-btn:active {
  transform: scale(0.94);
}

.icon-btn--danger:hover {
  background: rgba(251, 113, 133, 0.18);
  border-color: rgba(251, 113, 133, 0.55);
  color: #fecdd3;
}

/* ---------- Pagination ---------- */
.dash-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem 1.75rem;
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.page-info {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.55rem 0.95rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.15s ease;
}

.page-btn svg {
  width: 16px;
  height: 16px;
  transition: transform 0.18s ease;
}

.page-btn:hover:not(:disabled) svg {
  transform: scale(1.2);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-num--active {
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.22);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.6);
  color: var(--accent);
  font-weight: 700;
}

.page-current {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
  padding: 0 0.4rem;
}

/* ---------- Hub header: segmented switcher + CTA ---------- */
.hub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem 1.25rem 0;
  box-sizing: border-box;
}

.hub-switcher {
  position: relative;
  display: inline-flex;
  padding: 0.3rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    rgba(10, 14, 26, 0.55);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* Sliding active indicator */
.hub-thumb {
  position: absolute;
  top: 0.3rem;
  bottom: 0.3rem;
  left: 0.3rem;
  width: calc(50% - 0.3rem);
  border-radius: 60px;
  border: 1px solid rgba(var(--accent-rgb, 201, 168, 124), 0.55);
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.2);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.hub-thumb--right {
  transform: translateX(100%);
}

.hub-tab {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.4rem;
  border-radius: 60px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;
}

.hub-tab:hover {
  color: var(--text-primary);
}

.hub-tab--active {
  color: var(--accent);
  font-weight: 700;
}

.hub-tab-icon {
  display: inline-flex;
}

.hub-tab-count {
  font-size: 0.72rem;
  padding: 0.1rem 0.55rem;
  border-radius: 60px;
  background: rgba(255, 255, 255, 0.08);
}

.hub-tab--active .hub-tab-count {
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.28);
}

.hub-cta {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.hub-new {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.4rem;
  border-radius: 60px;
  border: 1px solid rgba(52, 211, 153, 0.45);
  background:
    linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(52, 211, 153, 0.08)),
    rgba(52, 211, 153, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: #d1fae5;
  font-size: 0.87rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.hub-new:hover {
  background: rgba(52, 211, 153, 0.24);
}

.hub-new:active {
  transform: scale(0.97);
}

.hub-status {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.15rem;
  border-radius: 60px;
  border: 1px solid rgba(52, 211, 153, 0.45);
  background: rgba(52, 211, 153, 0.1);
  color: #d1fae5;
  font-size: 0.84rem;
  font-weight: 700;
  white-space: nowrap;
}

.hub-status--partial {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.1);
  color: #fde68a;
}

/* ---------- Experiences toolbar (grid + cards live in components) ---------- */
.dash-controls--exp {
  flex-direction: row;
  align-items: center;
}

.dash-controls--exp .control-search {
  flex: 1;
}

/* ---------- Copy-link toast ---------- */
.copy-toast {
  position: fixed;
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  max-width: min(92%, 560px);
  padding: 0.7rem 1.2rem;
  border-radius: 60px;
  border: 1px solid rgba(52, 211, 153, 0.55);
  background: rgba(6, 40, 28, 0.94);
  color: #a7f3d0;
  font-size: 0.85rem;
  font-family: ui-monospace, Consolas, monospace;
  z-index: 60;
}

.publish-toast-enter-active,
.publish-toast-leave-active {
  transition: opacity 0.3s ease;
}

.publish-toast-enter-from,
.publish-toast-leave-to {
  opacity: 0;
}

/* ---------- Copy-link toast ---------- */

/* ---------- Wide layout: 1400px centered container ---------- */
.breadcrumbs,
.hub-header,
.dash-metrics,
.dash-controls,
.dash-list,
.dash-pagination {
  max-width: 1400px;
}

/* ---------- Mobile <768px: swipeable pills, stacked toolbar ---------- */
@media (max-width: 767px) {
  .dash-topbar {
    padding: 0.6rem 0.9rem;
    gap: 0.5rem;
  }

  .dash-brand {
    font-size: 0.95rem;
  }

  .dash-brand svg {
    width: 20px;
    height: 20px;
  }

  .dash-logout {
    width: 48px;
    height: 48px;
  }

  /* Hub header stacks full-width: switcher + CTA */
  .hub-header {
    flex-direction: column;
    align-items: stretch;
    padding: 0.9rem 0.9rem 0;
  }

  .hub-switcher {
    width: 100%;
    box-sizing: border-box;
  }

  .hub-tab {
    min-height: 48px;
    padding: 0.6rem 0.5rem;
    font-size: 0.84rem;
  }

  .hub-tab-count {
    font-size: 0.7rem;
  }

  .hub-cta {
    width: 100%;
  }

  .hub-new,
  .hub-status {
    width: 100%;
    justify-content: center;
    min-height: 52px;
  }

  /* Metric pills become a swipeable chip rail (no visible scrollbars) */
  .dash-metrics {
    display: flex;
    gap: 0.55rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 0.9rem 0.9rem 0.2rem;
    scroll-snap-type: x proximity;
  }

  .dash-metrics::-webkit-scrollbar {
    display: none;
  }

  .metric-card {
    flex: 0 0 auto;
    min-width: 136px;
    min-height: 84px;
    padding: 0.8rem 0.6rem;
    scroll-snap-align: start;
  }

  .metric-value {
    font-size: 1.45rem;
  }

  .metric-secondary {
    display: none;
  }

  /* Unified toolbar stays visible: search full-width, sort wraps below */
  .dash-controls,
  .dash-controls--exp {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0.9rem 0.9rem 0;
  }

  .control-search {
    max-width: none;
  }

  .control-sort {
    flex-wrap: wrap;
    margin-left: 0;
    width: 100%;
  }

  .result-count {
    margin-left: 0;
    width: 100%;
  }

  .article-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .dash-list {
    padding: 0.9rem 0.9rem 1.5rem;
  }

  .dash-pagination {
    padding: 0.8rem 0.9rem 1.5rem;
  }

  .page-btn {
    min-width: 48px;
    min-height: 48px;
  }

  .page-btn svg {
    width: 18px;
    height: 18px;
  }

  .row-skeleton {
    height: 120px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .metric-card,
  .hub-tab,
  .hub-thumb,
  .row-skeleton,
  .copy-toast,
  .icon-btn svg {
    animation: none;
    transition: none;
  }
}
</style>
