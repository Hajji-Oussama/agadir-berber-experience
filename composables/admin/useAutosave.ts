export interface LocalDraft {
  metadata: Record<string, unknown>
  rawContent: string
  timestamp: number
}

const AUTOSAVE_DELAY_MS = 3000

function storageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

export function useAutosave() {
  const hasDraft = ref<boolean>(false)
  const draftTime = ref<string | null>(null)
  const isAutosaving = ref<boolean>(false)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const keyFor = (locale: string, slug: string): string => `cms_draft_${locale}_${slug}`

  function saveLocalDraft(
    locale: string,
    slug: string,
    metadata: Record<string, unknown>,
    rawContent: string
  ): void {
    if (!storageAvailable() || !locale || !slug) return
    if (debounceTimer) clearTimeout(debounceTimer)
    isAutosaving.value = true
    debounceTimer = setTimeout(() => {
      try {
        window.localStorage.setItem(
          keyFor(locale, slug),
          JSON.stringify({ metadata, rawContent, timestamp: Date.now() })
        )
      } catch {
        // Quota or privacy mode: autosave is best-effort, never fatal.
      } finally {
        isAutosaving.value = false
      }
    }, AUTOSAVE_DELAY_MS)
  }

  function checkExistingDraft(
    locale: string,
    slug: string,
    diskSavedContent: string
  ): boolean {
    hasDraft.value = false
    draftTime.value = null
    if (!storageAvailable() || !locale || !slug) return false
    let draft: LocalDraft | null = null
    try {
      const raw = window.localStorage.getItem(keyFor(locale, slug))
      if (!raw) return false
      draft = JSON.parse(raw) as LocalDraft
    } catch {
      return false
    }
    if (!draft || typeof draft.rawContent !== 'string') return false
    if (draft.rawContent === (diskSavedContent ?? '')) return false
    hasDraft.value = true
    try {
      draftTime.value = new Date(draft.timestamp).toLocaleString()
    } catch {
      draftTime.value = null
    }
    return true
  }

  function restoreDraft(locale: string, slug: string): LocalDraft | null {
    if (!storageAvailable() || !locale || !slug) return null
    try {
      const raw = window.localStorage.getItem(keyFor(locale, slug))
      if (!raw) return null
      const draft = JSON.parse(raw) as LocalDraft
      if (!draft || typeof draft.rawContent !== 'string') return null
      return {
        metadata:
          draft.metadata && typeof draft.metadata === 'object' ? draft.metadata : {},
        rawContent: draft.rawContent,
      }
    } catch {
      try {
        window.localStorage.removeItem(keyFor(locale, slug))
      } catch {
        // best effort
      }
      return null
    }
  }

  function clearDraft(locale: string, slug: string): void {
    if (storageAvailable() && locale && slug) {
      try {
        window.localStorage.removeItem(keyFor(locale, slug))
      } catch {
        // best effort
      }
    }
    hasDraft.value = false
    draftTime.value = null
  }

  onScopeDispose(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  return {
    hasDraft,
    draftTime,
    isAutosaving,
    saveLocalDraft,
    checkExistingDraft,
    restoreDraft,
    clearDraft,
  }
}
