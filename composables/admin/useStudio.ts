export type StudioLocale = 'ar' | 'en' | 'fr'
export type ViewMode = 'split' | 'editor' | 'preview'
export type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error'

export interface StudioArticleListItem {
  slug: string
  locale: StudioLocale
  title: string
  date: string
  image: string
}

export interface StudioArticle {
  metadata: Record<string, unknown>
  rawContent: string
}

function hashSnapshot(snapshot: string): string {
  let hash = 5381
  for (let i = 0; i < snapshot.length; i++) {
    hash = ((hash << 5) + hash + snapshot.charCodeAt(i)) >>> 0
  }
  return hash.toString(16)
}

export function useStudio() {
  const router = useRouter()

  const articles = ref<StudioArticleListItem[]>([])
  const currentArticle = ref<StudioArticle | null>(null)
  const activeLocale = ref<StudioLocale>('ar')
  const activeSlug = ref<string>('')
  const viewMode = ref<ViewMode>('split')
  const saveStatus = ref<SaveStatus>('saved')
  const errorMessage = ref<string | null>(null)
  const saveWarnings = ref<string[]>([])
  const initialContentHash = ref<string>('')
  const savedFlash = ref<boolean>(false)

  let flashTimer: ReturnType<typeof setTimeout> | null = null

  const snapshotOf = (): string =>
    JSON.stringify({
      metadata: currentArticle.value?.metadata ?? null,
      rawContent: currentArticle.value?.rawContent ?? '',
    })

  function checkDirty(): void {
    if (saveStatus.value === 'saving') return
    saveStatus.value =
      hashSnapshot(snapshotOf()) === initialContentHash.value ? 'saved' : 'dirty'
  }

  async function fetchArticles(): Promise<void> {
    try {
      // Paginated envelope `{ items, total, ... }`, tolerant of a legacy
      // plain-array payload. limit=50 keeps the editor selector complete.
      const res = await $fetch<{
        success: boolean
        data: StudioArticleListItem[] | { items?: unknown } | null | undefined
      }>('/api/admin/articles', { query: { limit: 50 } })
      const data = res?.data
      if (Array.isArray(data)) {
        articles.value = data
      } else if (data && Array.isArray((data as { items?: unknown }).items)) {
        articles.value = (data as { items: StudioArticleListItem[] }).items
      } else {
        articles.value = []
      }
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : 'Failed to fetch articles.'
    }
  }

  async function loadArticle(locale: StudioLocale, slug: string): Promise<void> {
    try {
      const res = await $fetch<{
        success: boolean
        data: { metadata: Record<string, unknown>; rawContent: string }
      }>('/api/admin/article', { query: { locale, slug } })
      currentArticle.value = {
        metadata: res.data?.metadata ?? {},
        rawContent: res.data?.rawContent ?? '',
      }
      activeLocale.value = locale
      activeSlug.value = slug
      initialContentHash.value = hashSnapshot(snapshotOf())
      saveStatus.value = 'saved'
      errorMessage.value = null
      saveWarnings.value = []
      await router.replace({ query: { locale, slug } })
    } catch (err: unknown) {
      const wrapped = err as { data?: { error?: { message?: string } }; message?: string }
      saveStatus.value = 'error'
      errorMessage.value =
        wrapped?.data?.error?.message || wrapped?.message || 'Failed to load article.'
    }
  }

  async function saveCurrentArticle(): Promise<void> {
    if (saveStatus.value === 'saving') return
    if (!currentArticle.value || !activeSlug.value) {
      saveStatus.value = 'error'
      errorMessage.value = 'No article loaded.'
      return
    }
    saveStatus.value = 'saving'
    errorMessage.value = null
    saveWarnings.value = []
    try {
      const res = await $fetch<{
        success: boolean
        data?: { warnings?: string[] }
        error?: { message?: string }
      }>('/api/admin/save', {
        method: 'POST',
        body: {
          locale: activeLocale.value,
          slug: activeSlug.value,
          metadata: currentArticle.value.metadata,
          rawContent: currentArticle.value.rawContent,
        },
      })
      saveWarnings.value = Array.isArray(res?.data?.warnings) ? res.data.warnings : []
      initialContentHash.value = hashSnapshot(snapshotOf())
      saveStatus.value = 'saved'
      savedFlash.value = true
      if (flashTimer) clearTimeout(flashTimer)
      if (typeof window !== 'undefined') {
        flashTimer = setTimeout(() => {
          savedFlash.value = false
        }, 2500)
      }
      await fetchArticles()
    } catch (err: unknown) {
      const wrapped = err as { data?: { error?: { message?: string } }; message?: string }
      saveStatus.value = 'error'
      errorMessage.value =
        wrapped?.data?.error?.message || wrapped?.message || 'Save failed.'
    }
  }

  const DRAFT_SKELETON: Record<
    StudioLocale,
    { intro: string; toc: string; faq: string; bookingTitle: string }
  > = {
    ar: {
      intro: 'مقدمة تجيب عن نية البحث في جملتين أو ثلاث.',
      toc: '## المحاور الرئيسية',
      faq: '## الأسئلة الشائعة',
      bookingTitle: 'Sunset Quad Biking',
    },
    en: {
      intro: 'Intro paragraph answering the search intent in 2-3 sentences.',
      toc: '## Key Sections',
      faq: '## Frequently Asked Questions',
      bookingTitle: 'Sunset Quad Biking',
    },
    fr: {
      intro: "Paragraphe d'introduction répondant à l'intention de recherche en 2-3 phrases.",
      toc: '## Sections Clés',
      faq: '## Questions Fréquentes',
      bookingTitle: 'Sunset Quad Biking',
    },
  }

  async function createNewDraft(
    locale: StudioLocale,
    title: string,
    slug: string
  ): Promise<void> {
    const cleanTitle = title.trim()
    const skeleton = DRAFT_SKELETON[locale]
    currentArticle.value = {
      metadata: {
        title: cleanTitle,
        description: '',
        image: '/images/blog/default.webp',
        author: 'Agadir Berbère Team',
        date: new Date().toISOString().slice(0, 10),
        sitemap: { loc: `/${locale}/blog/${slug}` },
      },
      rawContent: [
        ':trust-badges',
        '',
        skeleton.intro,
        '',
        skeleton.toc,
        '',
        `:booking-card{title="${skeleton.bookingTitle}" price="400 MAD" link="/${locale}/experiences/quad-biking"}`,
        '',
        skeleton.faq,
        '',
        `:share-buttons`,
      ].join('\n'),
    }
    activeLocale.value = locale
    activeSlug.value = slug
    saveStatus.value = 'dirty'
    errorMessage.value = null
    saveWarnings.value = []
    await router.replace({ query: { locale, slug } })
  }

  function onBeforeUnload(e: BeforeUnloadEvent): void {
    e.preventDefault()
    e.returnValue = ''
  }

  function syncUnloadGuard(): void {
    if (typeof window === 'undefined') return
    if (saveStatus.value === 'dirty') {
      window.addEventListener('beforeunload', onBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }

  watch(saveStatus, syncUnloadGuard)

  onScopeDispose(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
    if (flashTimer) clearTimeout(flashTimer)
  })

  return {
    articles,
    currentArticle,
    activeLocale,
    activeSlug,
    viewMode,
    saveStatus,
    errorMessage,
    saveWarnings,
    initialContentHash,
    savedFlash,
    fetchArticles,
    loadArticle,
    saveCurrentArticle,
    createNewDraft,
    checkDirty,
  }
}
