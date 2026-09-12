<template>
  <div class="studio-shell" dir="ltr">
    <!-- Auth-gated by layouts/admin.vue: this subtree only mounts when authenticated -->
    <AdminStudioHeader
      v-if="!isZenMode"
      :articles="articles"
      :active-locale="activeLocale"
      :active-slug="activeSlug"
      :dirty="saveStatus === 'dirty'"
      :view-mode="viewMode"
      :save-status="saveStatus"
      :error-message="errorMessage"
      :reading-time="readingTime"
      @select="onSelectArticle"
      @change-mode="setViewMode"
      @save="saveCurrentArticle"
      @publish="isPublishModalOpen = true"
      @create-draft="onCreateDraft"
      @toggle-zen="isZenMode = !isZenMode"
      @logout="logout"
    />

    <button
      v-if="isZenMode"
      type="button"
      class="zen-exit"
      title="Exit focus mode (Esc)"
      @click="exitZenMode"
    >
      ✕ خروج من وضع التركيز (Esc)
    </button>

    <div v-if="hasDraft && !isZenMode" class="draft-banner">
      <span>
        توجد مسودة محلية أحدث من النسخة المحفوظة على القرص.
        <span v-if="draftTime">({{ draftTime }})</span>
      </span>
      <span class="draft-banner-actions">
        <button type="button" class="draft-btn draft-btn--restore" @click="onRestoreDraft">
          استعادة المسودة
        </button>
        <button type="button" class="draft-btn" @click="onDismissDraft">
          تجاهل
        </button>
      </span>
    </div>

    <AdminFrontmatterPanel
      v-if="!loading && currentArticle && !isZenMode"
      ref="panelRef"
      @open-media="openMediaModal"
    />

    <main class="studio-main">
      <div v-if="loading" class="studio-empty">Loading articles… / جاري التحميل…</div>

      <div v-else-if="!currentArticle" class="studio-empty">
        No article selected. / لا يوجد مقال محدد.
      </div>

      <AdminSplitPane v-else :mode="viewMode">
        <template #left>
          <section class="editor-pane">
            <div class="pane-label">Editor — {{ activeLocale }}/{{ activeSlug }}</div>
            <AdminEditorToolbar
              :stats="editorStats"
              :capture-selection="captureEditorRange"
              @action="handleToolbarAction"
              @open-media="openMediaModal"
              @open-mdc="openMdcModal"
            />
            <ClientOnly>
              <AdminCodeEditor
                v-if="currentArticle"
                ref="codeEditorRef"
                :model-value="currentArticle.rawContent"
                :locale="activeLocale"
                @update:model-value="onEditorInput"
                @save="saveCurrentArticle"
              />
              <template #fallback>
                <textarea
                  v-if="currentArticle"
                  v-model="currentArticle.rawContent"
                  class="editor-textarea editor-fallback-textarea"
                  :dir="activeLocale === 'ar' ? 'rtl' : 'ltr'"
                  spellcheck="false"
                  @input="checkDirty()"
                ></textarea>
              </template>
            </ClientOnly>
          </section>
        </template>

        <template #right>
          <section class="preview-pane">
            <div class="pane-label">Preview / معاينة</div>
            <AdminLivePreview
              v-if="currentArticle"
              ref="previewRef"
              class="preview-live"
              :raw-content="currentArticle.rawContent"
              :metadata="currentArticle.metadata"
              :locale="activeLocale"
              :ast="parsedAst"
              :is-parsing="isParsing"
              :parse-error="parseError"
              @scroll="onPreviewScroll"
            />
          </section>
        </template>
      </AdminSplitPane>

      <div v-if="saveStatus === 'error' && errorMessage" class="studio-error">
        {{ errorMessage }}
      </div>
    </main>

    <AdminMediaModal
      :is-open="isMediaModalOpen"
      :mode="mediaModalMode"
      @close="isMediaModalOpen = false"
      @select-featured="onSelectFeatured"
      @insert-content="onInsertContent"
    />

    <AdminMdcInspectorModal
      :is-open="isMdcModalOpen"
      :active-locale="activeLocale"
      @close="isMdcModalOpen = false"
      @insert="onInsertMdc"
    />

    <AdminPublishModal
      :is-open="isPublishModalOpen"
      :active-locale="activeLocale"
      :active-slug="activeSlug"
      :article-title="String(currentArticle?.metadata?.title ?? '')"
      :metadata="currentArticle?.metadata ?? {}"
      :raw-content="currentArticle?.rawContent ?? ''"
      @close="isPublishModalOpen = false"
      @published="onPublished"
    />

    <Transition name="publish-toast">
      <div v-if="publishToast" class="publish-toast" dir="auto">{{ publishToast }}</div>
    </Transition>

    <Transition name="publish-toast">
      <div
        v-if="saveWarnings.length > 0 && saveStatus === 'saved'"
        class="save-warnings-toast"
        dir="auto"
      >
        <span class="save-warnings-title">SEO recommendations / توصيات:</span>
        <ul>
          <li v-for="(warning, index) in saveWarnings" :key="index">{{ warning }}</li>
        </ul>
      </div>
    </Transition>

    <div v-if="!loading && currentArticle" class="mobile-action-bar">
      <span
        class="mobile-status"
        :class="`mobile-status--${saveStatus}`"
        :title="saveStatus"
      ></span>
      <button type="button" class="mobile-action" @click="saveCurrentArticle">
        💾 حفظ
      </button>
      <button type="button" class="mobile-action mobile-action--publish" @click="isPublishModalOpen = true">
        🚀 نشر
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStudio } from '~/composables/admin/useStudio'
import type { StudioLocale, ViewMode } from '~/composables/admin/useStudio'
import { useMdcRenderer } from '~/composables/admin/useMdcRenderer'
import { useAutosave } from '~/composables/admin/useAutosave'

definePageMeta({
  layout: 'admin',
})

// Exempt the Studio from i18n routing: it is a locale-agnostic internal
// tool, and this silences "[Vue Router warn]: No match found for
// location with path /admin/editor". Plain call (not `?.`): the macro
// always exists with @nuxtjs/i18n installed, and optional chaining does
// not guard undeclared bindings anyway.
defineI18nRoute(false)

useHead({
  title: 'CMS Studio — Agadir Berbère Expérience',
})

const route = useRoute()
const studio = useStudio()
const {
  articles,
  currentArticle,
  activeLocale,
  activeSlug,
  viewMode,
  saveStatus,
  errorMessage,
  saveWarnings,
  fetchArticles,
  loadArticle,
  saveCurrentArticle,
  createNewDraft,
  checkDirty,
} = studio

const loading = ref(true)
const panelRef = ref<{ toggle: () => void } | null>(null)
const isMediaModalOpen = ref(false)
const mediaModalMode = ref<'featured' | 'content'>('content')
const isMdcModalOpen = ref(false)
const savedCursorRange = ref<{ from: number; to: number } | null>(null)
const codeEditorRef = ref<{
  insertBold: () => void
  insertItalic: () => void
  insertHeading: (level: 2 | 3) => void
  insertLink: () => void
  insertTable: () => void
  cleanDocument: () => void
  getCursorPosition: () => { from: number; to: number }
  insertSnippet: (snippet: string, targetRange?: { from: number; to: number }) => void
  getScrollerElement: () => HTMLElement | null
  scrollToRatio: (ratio: number) => void
} | null>(null)

const previewRef = ref<{ scrollToRatio: (ratio: number) => void } | null>(null)
const isPublishModalOpen = ref(false)
const publishToast = ref<string | null>(null)

let publishToastTimer: ReturnType<typeof setTimeout> | null = null

const autosave = useAutosave()
const { hasDraft, draftTime, saveLocalDraft, checkExistingDraft, restoreDraft, clearDraft } =
  autosave

const renderer = useMdcRenderer()
const { parsedAst, isParsing, parseError, renderMdc, flushNow } = renderer

let isScrollingEditor = false
let isScrollingPreview = false
let scrollLockTimer: ReturnType<typeof setTimeout> | null = null
let editorScrollListener: (() => void) | null = null

function releaseScrollLocks(): void {
  if (scrollLockTimer) clearTimeout(scrollLockTimer)
  scrollLockTimer = setTimeout(() => {
    isScrollingEditor = false
    isScrollingPreview = false
  }, 50)
}

function attachEditorScrollSync(): void {
  detachEditorScrollSync()
  const scroller = codeEditorRef.value?.getScrollerElement() ?? null
  if (!scroller || typeof window === 'undefined') return
  const onEditorScroll = () => {
    if (isScrollingPreview) return
    if (scroller.scrollHeight <= scroller.clientHeight) return
    const ratio = scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight)
    isScrollingEditor = true
    try {
      previewRef.value?.scrollToRatio(ratio)
    } finally {
      releaseScrollLocks()
    }
  }
  scroller.addEventListener('scroll', onEditorScroll, { passive: true })
  editorScrollListener = () => scroller.removeEventListener('scroll', onEditorScroll)
}

function detachEditorScrollSync(): void {
  if (editorScrollListener) {
    try {
      editorScrollListener()
    } catch {
      // best effort
    }
    editorScrollListener = null
  }
}

function onPreviewScroll(ratio: number): void {
  if (isScrollingEditor) return
  isScrollingPreview = true
  try {
    codeEditorRef.value?.scrollToRatio(ratio)
  } finally {
    releaseScrollLocks()
  }
}

watch(
  () => currentArticle.value?.rawContent,
  (next) => {
    renderMdc(next ?? '')
  }
)

watch(viewMode, (mode) => {
  if (mode === 'preview') {
    flushNow(currentArticle.value?.rawContent ?? '')
  }
  if (typeof window !== 'undefined') {
    window.requestAnimationFrame(() => {
      attachEditorScrollSync()
    })
  }
})

const editorStats = computed(() => {
  const text = currentArticle.value?.rawContent ?? ''
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  return { words, lines: text.split('\n').length }
})

function onEditorInput(value: string): void {
  if (currentArticle.value) {
    currentArticle.value.rawContent = value
    checkDirty()
  }
}

function captureEditorRange(): { from: number; to: number } | null {
  try {
    return codeEditorRef.value?.getCursorPosition() ?? null
  } catch {
    return null
  }
}

function openMediaModal(
  mode: 'featured' | 'content',
  range?: { from: number; to: number } | null
): void {
  mediaModalMode.value = mode
  savedCursorRange.value = range ?? captureEditorRange()
  isMediaModalOpen.value = true
}

function onSelectFeatured(url: string): void {
  if (currentArticle.value) {
    currentArticle.value.metadata.image = url
    checkDirty()
  }
  isMediaModalOpen.value = false
}

function onInsertContent(snippet: string): void {
  codeEditorRef.value?.insertSnippet(snippet, savedCursorRange.value ?? undefined)
  checkDirty()
  isMediaModalOpen.value = false
}

function openMdcModal(range?: { from: number; to: number } | null): void {
  savedCursorRange.value = range ?? captureEditorRange()
  isMdcModalOpen.value = true
}

function onInsertMdc(snippet: string): void {
  codeEditorRef.value?.insertSnippet(snippet, savedCursorRange.value ?? undefined)
  checkDirty()
  isMdcModalOpen.value = false
}

function handleToolbarAction(action: string): void {
  const editor = codeEditorRef.value
  if (!editor) return
  switch (action) {
    case 'bold':
      editor.insertBold()
      break
    case 'italic':
      editor.insertItalic()
      break
    case 'h2':
      editor.insertHeading(2)
      break
    case 'h3':
      editor.insertHeading(3)
      break
    case 'link':
      editor.insertLink()
      break
    case 'table':
      editor.insertTable()
      break
    case 'clean':
      editor.cleanDocument()
      break
    default:
      break
  }
}

// Share the single useStudio instance with admin panels (provide/inject
// keeps SSR-safe per-request state without extra dependencies).
provide('cms-studio', studio)

function setViewMode(mode: ViewMode): void {
  viewMode.value = mode
}

function onSelectArticle(locale: StudioLocale, slug: string): void {
  void loadArticle(locale, slug).then(() => {
    checkExistingDraft(locale, slug, currentArticle.value?.rawContent ?? '')
  })
}

function onCreateDraft(locale: StudioLocale, title: string, slug: string): void {
  void createNewDraft(locale, title, slug).then(() => {
    flushNow(currentArticle.value?.rawContent ?? '')
    attachEditorScrollSync()
    checkExistingDraft(locale, slug, currentArticle.value?.rawContent ?? '')
  })
}

function onRestoreDraft(): void {
  const draft = restoreDraft(activeLocale.value, activeSlug.value)
  if (draft && currentArticle.value) {
    currentArticle.value = { metadata: draft.metadata, rawContent: draft.rawContent }
    checkDirty()
  }
  clearDraft(activeLocale.value, activeSlug.value)
}

function onDismissDraft(): void {
  clearDraft(activeLocale.value, activeSlug.value)
}

function showPublishToast(message: string): void {
  publishToast.value = message
  if (publishToastTimer) clearTimeout(publishToastTimer)
  publishToastTimer = setTimeout(() => {
    publishToast.value = null
  }, 4000)
}

function onPublished(commitHash: string): void {
  clearDraft(activeLocale.value, activeSlug.value)
  saveStatus.value = 'saved'
  showPublishToast(`تم النشر بنجاح #${commitHash} / Published live #${commitHash}`)
}

// Autosave every keystroke-driven mutation (debounced 3s inside the composable).
watch(
  () => [currentArticle.value?.rawContent ?? '', JSON.stringify(currentArticle.value?.metadata ?? {})],
  () => {
    if (!currentArticle.value || !activeSlug.value) return
    saveLocalDraft(
      activeLocale.value,
      activeSlug.value,
      currentArticle.value.metadata,
      currentArticle.value.rawContent
    )
  }
)

function onGlobalKeydown(e: KeyboardEvent): void {
  if (!e || typeof e.key !== 'string') return
  const key = e.key.toLowerCase()
  if ((e.ctrlKey || e.metaKey) && key === 's') {
    e.preventDefault()
    void saveCurrentArticle()
  } else if (e.altKey && e.key === '1') {
    e.preventDefault()
    viewMode.value = 'editor'
  } else if (e.altKey && e.key === '2') {
    e.preventDefault()
    viewMode.value = 'split'
  } else if (e.altKey && e.key === '3') {
    e.preventDefault()
    viewMode.value = 'preview'
  } else if (e.altKey && (key === 'm' || key === 'µ')) {
    e.preventDefault()
    panelRef.value?.toggle()
  } else if (e.altKey && key === 'c') {
    e.preventDefault()
    openMdcModal()
  } else if (e.altKey && key === 'z') {
    e.preventDefault()
    isZenMode.value = !isZenMode.value
  } else if (e.key === 'Escape' && isZenMode.value && !anyModalOpen()) {
    isZenMode.value = false
  }
}

function isStudioLocale(value: unknown): value is StudioLocale {
  return value === 'ar' || value === 'en' || value === 'fr'
}

const isZenMode = ref(false)

// Auth state is owned by layouts/admin.vue; this page initializes its
// workspace only once the layout confirms the session.
const adminAuth = inject<{
  isAuthenticated: Ref<boolean>
  setAuthenticated: (value: boolean) => void
}>('admin-auth', {
  isAuthenticated: ref(false),
  setAuthenticated: () => {},
})
let workspaceInitialized = false

const readingTime = computed(() => {
  const words = editorStats.value.words
  const minutes = Math.max(1, Math.round(words / 180))
  if (minutes === 1) return '⏱️ دقيقة واحدة للقراءة'
  if (minutes === 2) return '⏱️ دقيقتان للقراءة'
  if (minutes <= 10) return `⏱️ ${minutes} دقائق للقراءة`
  return `⏱️ ${minutes} دقيقة للقراءة`
})

function exitZenMode(): void {
  isZenMode.value = false
}

function anyModalOpen(): boolean {
  return (
    isMediaModalOpen.value || isMdcModalOpen.value || isPublishModalOpen.value
  )
}

async function logout(): Promise<void> {
  try {
    await $fetch('/api/admin/auth/logout', { method: 'POST' })
  } catch {
    // Best effort: lock the UI even if the request fails.
  } finally {
    exitZenMode()
    isMediaModalOpen.value = false
    isMdcModalOpen.value = false
    isPublishModalOpen.value = false
    workspaceInitialized = false
    adminAuth.setAuthenticated(false)
  }
}

async function initializeWorkspace(): Promise<void> {
  try {
    await fetchArticles()
    const queryLocale = Array.isArray(route.query.locale)
      ? route.query.locale[0]
      : route.query.locale
    const querySlug = Array.isArray(route.query.slug) ? route.query.slug[0] : route.query.slug
    const queryDraft = Array.isArray(route.query.draft)
      ? route.query.draft[0]
      : route.query.draft
    // Dashboard "New Article" flow: in-memory draft, saved on first Ctrl+S.
    if (
      isStudioLocale(queryLocale) &&
      typeof querySlug === 'string' &&
      /^[a-z0-9-]+$/.test(querySlug) &&
      typeof queryDraft === 'string' &&
      queryDraft.trim() !== ''
    ) {
      await createNewDraft(queryLocale, queryDraft.trim().slice(0, 120), querySlug)
      articles.value.unshift({
        slug: querySlug,
        locale: queryLocale,
        title: queryDraft.trim().slice(0, 120),
        date: new Date().toISOString().slice(0, 10),
        image: '/images/blog/default.webp',
      })
      flushNow(currentArticle.value?.rawContent ?? '')
      attachEditorScrollSync()
      return
    }
    if (
      isStudioLocale(queryLocale) &&
      typeof querySlug === 'string' &&
      querySlug !== '' &&
      articles.value.some((a) => a.locale === queryLocale && a.slug === querySlug)
    ) {
      await loadArticle(queryLocale, querySlug)
    } else if (articles.value.length > 0) {
      const first = articles.value[0]
      await loadArticle(first.locale, first.slug)
    }
    flushNow(currentArticle.value?.rawContent ?? '')
    attachEditorScrollSync()
    checkExistingDraft(activeLocale.value, activeSlug.value, currentArticle.value?.rawContent ?? '')
  } finally {
    loading.value = false
  }
}

// Data loading happens exclusively here, triggered only when the layout
// confirms the session. Nothing is fetched pre-auth: this subtree does not
// even exist in the DOM until layouts/admin.vue renders the slot.
watch(
  () => adminAuth.isAuthenticated.value,
  async (authenticated) => {
    if (!authenticated || workspaceInitialized) return
    workspaceInitialized = true
    loading.value = true
    await initializeWorkspace()
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  detachEditorScrollSync()
  if (scrollLockTimer) clearTimeout(scrollLockTimer)
  if (publishToastTimer) clearTimeout(publishToastTimer)
})
</script>

<style scoped>
.studio-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: var(--bg-gradient);
  color: var(--text-primary);
  overflow: hidden;
}

.studio-main {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
}

.studio-empty {
  margin: auto;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.editor-pane,
.preview-pane {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.pane-label {
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor-textarea {
  flex: 1 1 auto;
  min-height: 0;
  resize: none;
  padding: 1rem 1.25rem;
  border: none;
  outline: none;
  background: rgba(0, 0, 0, 0.25);
  color: var(--text-primary);
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.88rem;
  line-height: 1.7;
}

.editor-textarea:focus {
  background: rgba(0, 0, 0, 0.35);
}

.preview-live {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.draft-banner {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 1rem;
  border-bottom: 1px solid rgba(251, 191, 36, 0.4);
  background: rgba(60, 42, 5, 0.85);
  color: #fde68a;
  font-size: 0.82rem;
}

.draft-banner-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.draft-btn {
  padding: 0.35rem 0.9rem;
  border-radius: 60px;
  border: 1px solid rgba(251, 191, 36, 0.5);
  background: transparent;
  color: #fde68a;
  font-size: 0.78rem;
  cursor: pointer;
}

.draft-btn--restore {
  background: #fbbf24;
  border-color: #fbbf24;
  color: #000;
  font-weight: 600;
}

.publish-toast {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  max-width: min(90%, 560px);
  padding: 0.7rem 1.2rem;
  border-radius: 60px;
  border: 1px solid rgba(52, 211, 153, 0.55);
  background: rgba(6, 40, 28, 0.94);
  color: #a7f3d0;
  font-size: 0.85rem;
  z-index: 20;
}

.publish-toast-enter-active,
.publish-toast-leave-active {
  transition: opacity 0.3s ease;
}

.publish-toast-enter-from,
.publish-toast-leave-to {
  opacity: 0;
}

.save-warnings-toast {
  position: absolute;
  bottom: 1rem;
  inset-inline-end: 1rem;
  max-width: min(90%, 380px);
  padding: 0.7rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(251, 191, 36, 0.5);
  background: rgba(60, 42, 5, 0.94);
  color: #fde68a;
  font-size: 0.78rem;
  z-index: 20;
}

.save-warnings-title {
  font-weight: 600;
}

.save-warnings-toast ul {
  margin: 0.35rem 0 0;
  padding-inline-start: 1.1rem;
}

.save-warnings-toast li {
  margin-bottom: 0.2rem;
}

.zen-exit {
  position: fixed;
  top: 0.75rem;
  inset-inline-end: 0.75rem;
  z-index: 40;
  padding: 0.45rem 1rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: rgba(10, 14, 26, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-secondary);
  font-size: 0.78rem;
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.25s ease;
}

.zen-exit:hover {
  opacity: 1;
  color: var(--text-primary);
}

.mobile-action-bar {
  display: none;
}

@media (max-width: 767px) {
  .mobile-action-bar {
    position: fixed;
    bottom: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
    z-index: 30;
    height: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
}

.mobile-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9ca3af;
  flex-shrink: 0;
}

.mobile-status--saved {
  background: #34d399;
}

.mobile-status--dirty {
  background: #fbbf24;
}

.mobile-status--saving {
  background: #60a5fa;
  animation: preview-pulse 1s ease-in-out infinite;
}

.mobile-status--error {
  background: #f87171;
}

.mobile-action {
  padding: 0.55rem 1.4rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.mobile-action--publish {
  border-color: rgba(201, 168, 124, 0.55);
  background: linear-gradient(135deg, #e8c88a, #c9a87c);
  color: #000;
}

@keyframes preview-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.studio-error {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  max-width: min(90%, 560px);
  padding: 0.7rem 1.2rem;
  border-radius: 12px;
  border: 1px solid rgba(248, 113, 113, 0.55);
  background: rgba(60, 10, 10, 0.9);
  color: #fecaca;
  font-size: 0.85rem;
}
</style>
