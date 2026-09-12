<template>
  <div class="code-editor">
    <div ref="containerRef" class="code-editor-container"></div>
    <Transition name="clean-badge">
      <div v-if="showCleanBadge" class="clean-badge">
        تم تنظيف نص الذكاء الاصطناعي / Cleaned AI text formatting
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { EditorView, keymap } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import type { StudioLocale } from '~/composables/admin/useStudio'

// --sanitize-start--
function sanitizeAiContent(text: string): { text: string; changed: boolean } {
  // Normalize Windows line breaks first.
  let out = text.replace(/\r\n/g, '\n')
  // Global whitespace fixes: NBSP, zero-width space, BOM -> standard space.
  out = out.replace(/[\u00a0\u200b\ufeff]/g, ' ')
  // Curly single quotes -> straight quote everywhere (they break MDC arrays).
  out = out.replace(/[‘’]/g, "'")
  // Curly double quotes -> straight quotes ONLY inside MDC regions so that
  // intentional typographic quotes in article prose are preserved.
  const lines = out.split('\n')
  let inMdcBlock = false
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (trimmed.startsWith('::')) {
      // A line that is exactly `::` closes a block; `::name ...` opens one.
      inMdcBlock = trimmed !== '::'
      lines[i] = lines[i].replace(/[“”]/g, '"')
      continue
    }
    if (inMdcBlock) {
      lines[i] = lines[i].replace(/[“”]/g, '"')
      continue
    }
    lines[i] = lines[i].replace(/:[a-zA-Z0-9_-]+(\[[^\]]*\])?\{[^}]*\}/g, (span) =>
      span.replace(/[“”]/g, '"')
    )
  }
  out = lines.join('\n')
  return { text: out, changed: out !== text }
}
// --sanitize-end--

const props = withDefaults(
  defineProps<{
    modelValue?: string
    locale?: StudioLocale
  }>(),
  {
    modelValue: '',
    locale: 'ar',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'save'): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const showCleanBadge = ref(false)

let view: EditorView | null = null
let internalUpdate = false
let badgeTimer: ReturnType<typeof setTimeout> | null = null
const dirCompartment = new Compartment()

function flashCleanBadge(): void {
  showCleanBadge.value = true
  if (badgeTimer) clearTimeout(badgeTimer)
  badgeTimer = setTimeout(() => {
    showCleanBadge.value = false
  }, 3000)
}

function dirExtensions(locale: StudioLocale) {
  const rtl = locale === 'ar'
  return [
    EditorView.editorAttributes.of({ dir: rtl ? 'rtl' : 'ltr', lang: locale }),
    EditorView.theme({
      '.cm-content': rtl
        ? { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", fontSize: '15px', lineHeight: '1.9' }
        : { fontFamily: 'ui-monospace, Consolas, monospace' },
    }),
  ]
}

function wrapSelection(before: string, after: string): void {
  if (!view) return
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  view.dispatch({
    changes: { from, to, insert: before + selected + after },
    selection: selected ? undefined : { anchor: from + before.length },
  })
  view.focus()
}

function insertAtCursor(insert: string, selectFrom = 0, selectTo = 0): void {
  if (!view) return
  const { from, to } = view.state.selection.main
  view.dispatch({
    changes: { from, to, insert },
    selection:
      selectTo > selectFrom
        ? { anchor: from + selectFrom, head: from + selectTo }
        : { anchor: from + insert.length },
  })
  view.focus()
}

function insertBold(): void {
  wrapSelection('**', '**')
}

function insertItalic(): void {
  wrapSelection('*', '*')
}

function insertHeading(level: 2 | 3): void {
  insertAtCursor(level === 2 ? '\n## ' : '\n### ')
}

function insertLink(): void {
  if (!view) return
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  if (selected) {
    wrapSelection('[', '](url)')
  } else {
    insertAtCursor('[Title](url)', 1, 6)
  }
}

function insertTable(): void {
  insertAtCursor('\n\n| Col 1 | Col 2 |\n| --- | --- |\n|  |  |\n')
}

function cleanDocument(): void {
  if (!view) return
  const current = view.state.doc.toString()
  const { text, changed } = sanitizeAiContent(current)
  if (!changed) return
  view.dispatch({
    changes: { from: 0, to: current.length, insert: text },
  })
  view.focus()
  flashCleanBadge()
}

interface EditorRange {
  from: number
  to: number
}

function getCursorPosition(): EditorRange {
  if (!view) return { from: 0, to: 0 }
  const { from, to } = view.state.selection.main
  return { from, to }
}

function insertSnippet(snippet: string, targetRange?: EditorRange): void {
  if (!view) return
  const docLength = view.state.doc.length
  const base = targetRange ?? view.state.selection.main
  const from = Math.max(0, Math.min(base.from, docLength))
  const to = Math.max(0, Math.min(base.to, docLength))
  let insert = snippet
  if (from > 0) {
    const before = view.state.sliceDoc(Math.max(0, from - 2), from)
    if (before !== '\n\n') {
      insert = (before.endsWith('\n') ? '\n' : '\n\n') + insert
    }
  }
  if (to < docLength) {
    const after = view.state.sliceDoc(to, Math.min(docLength, to + 2))
    if (after !== '\n\n') {
      insert = insert + (after.startsWith('\n') ? '\n' : '\n\n')
    }
  }
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + insert.length },
  })
  view.focus()
}

function getScrollerElement(): HTMLElement | null {
  if (!view) return null
  return view.scrollDOM
}

function scrollToRatio(ratio: number): void {
  const scroller = getScrollerElement()
  if (!scroller) return
  scroller.scrollTop =
    Math.max(0, Math.min(1, ratio)) * (scroller.scrollHeight - scroller.clientHeight)
}

defineExpose({
  insertBold,
  insertItalic,
  insertHeading,
  insertLink,
  insertTable,
  cleanDocument,
  getCursorPosition,
  insertSnippet,
  getScrollerElement,
  scrollToRatio,
})

function handlePaste(event: ClipboardEvent, viewInstance: EditorView): boolean {
  const raw = event.clipboardData?.getData('text')
  if (raw == null || raw === '') return false
  const { text, changed } = sanitizeAiContent(raw)
  if (!changed) return false
  event.preventDefault()
  viewInstance.dispatch(viewInstance.state.replaceSelection(text))
  viewInstance.focus()
  flashCleanBadge()
  return true
}

onMounted(() => {
  if (!containerRef.value) return
  const startDoc = props.modelValue ?? ''
  view = new EditorView({
    parent: containerRef.value,
    state: EditorState.create({
      doc: startDoc,
      extensions: [
        markdown(),
        oneDark,
        history(),
        EditorView.lineWrapping,
        EditorView.theme({
          '&': { height: '100%', fontSize: '14px' },
          '.cm-scroller': { overflow: 'auto' },
        }),
        dirCompartment.of(dirExtensions(props.locale)),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          {
            key: 'Mod-s',
            run: () => {
              emit('save')
              return true
            },
            preventDefault: true,
          },
          {
            key: 'Mod-b',
            run: () => {
              insertBold()
              return true
            },
            preventDefault: true,
          },
          {
            key: 'Mod-i',
            run: () => {
              insertItalic()
              return true
            },
            preventDefault: true,
          },
          {
            key: 'Mod-k',
            run: () => {
              insertLink()
              return true
            },
            preventDefault: true,
          },
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !internalUpdate) {
            emit('update:modelValue', update.state.doc.toString())
          }
        }),
        EditorView.domEventHandlers({
          paste: handlePaste,
        }),
      ],
    }),
  })
})

watch(
  () => props.modelValue,
  (external) => {
    if (!view) return
    const next = external ?? ''
    if (next !== view.state.doc.toString()) {
      internalUpdate = true
      try {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: next },
        })
      } finally {
        internalUpdate = false
      }
    }
  }
)

watch(
  () => props.locale,
  (locale) => {
    if (!view) return
    view.dispatch({ effects: dirCompartment.reconfigure(dirExtensions(locale)) })
  }
)

onBeforeUnmount(() => {
  if (badgeTimer) clearTimeout(badgeTimer)
  view?.destroy()
  view = null
})
</script>

<style scoped>
.code-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.code-editor-container {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.code-editor-container :deep(.cm-editor) {
  height: 100%;
  background: rgba(0, 0, 0, 0.25);
}

.clean-badge {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1.1rem;
  border-radius: 60px;
  border: 1px solid rgba(52, 211, 153, 0.5);
  background: rgba(6, 40, 28, 0.92);
  color: #a7f3d0;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 5;
}

.clean-badge-enter-active,
.clean-badge-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.clean-badge-enter-from,
.clean-badge-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
