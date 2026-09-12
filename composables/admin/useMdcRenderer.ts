export interface MdcAst {
  body: unknown
  data: Record<string, unknown>
}

export function useMdcRenderer() {
  const parsedAst = ref<MdcAst | null>(null)
  const isParsing = ref<boolean>(false)
  const parseError = ref<string | null>(null)
  const lastValidAst = ref<MdcAst | null>(null)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let requestId = 0

  async function compile(rawContent: string): Promise<void> {
    const currentRequest = ++requestId
    isParsing.value = true
    try {
      const ast = (await parseMarkdown(rawContent ?? '')) as unknown as MdcAst
      // Drop stale responses when rapid keystrokes overlap compilations.
      if (currentRequest !== requestId) return
      if (!ast || (ast as { body?: unknown }).body == null) {
        throw new Error('Parser returned an empty document tree.')
      }
      parsedAst.value = ast
      lastValidAst.value = ast
      parseError.value = null
    } catch (err) {
      if (currentRequest !== requestId) return
      parseError.value =
        err instanceof Error ? err.message : 'Failed to parse markdown content.'
      // Error boundary: keep the last good tree so the preview never blanks.
      parsedAst.value = lastValidAst.value
    } finally {
      if (currentRequest === requestId) {
        isParsing.value = false
      }
    }
  }

  function renderMdc(rawContent: string): void {
    if (!import.meta.client) return
    if (debounceTimer) clearTimeout(debounceTimer)
    isParsing.value = true
    debounceTimer = setTimeout(() => {
      void compile(rawContent)
    }, 250)
  }

  function flushNow(rawContent: string): void {
    if (!import.meta.client) return
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    void compile(rawContent)
  }

  onScopeDispose(() => {
    requestId += 1
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  return {
    parsedAst,
    isParsing,
    parseError,
    lastValidAst,
    renderMdc,
    flushNow,
  }
}
