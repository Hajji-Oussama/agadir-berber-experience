<template>
  <div class="editor-toolbar">
    <div class="toolbar-actions" role="toolbar" aria-label="Markdown formatting">
      <button type="button" class="tool-btn tool-btn--strong" title="Bold (Ctrl+B)" @click="emit('action', 'bold')">
        B
      </button>
      <button type="button" class="tool-btn tool-btn--em" title="Italic (Ctrl+I)" @click="emit('action', 'italic')">
        I
      </button>
      <span class="tool-sep"></span>
      <button type="button" class="tool-btn" title="Heading 2" @click="emit('action', 'h2')">
        H2
      </button>
      <button type="button" class="tool-btn" title="Heading 3" @click="emit('action', 'h3')">
        H3
      </button>
      <span class="tool-sep"></span>
      <button type="button" class="tool-btn" title="Link (Ctrl+K)" @click="emit('action', 'link')">
        Link 🔗
      </button>
      <button type="button" class="tool-btn" title="Table" @click="emit('action', 'table')">
        Table 📊
      </button>
      <span class="tool-sep"></span>
      <button type="button" class="tool-btn tool-btn--clean" title="Clean AI text" @click="emit('action', 'clean')">
        Clean AI Text 🧹
      </button>
      <span class="tool-sep"></span>
      <button type="button" class="tool-btn" title="Media library" @click="openMediaLibrary">
        🖼️ وسائط / Media
      </button>
      <button type="button" class="tool-btn" title="MDC components (Alt+C)" @click="openMdcInspector">
        🧩 مكونات MDC / Components
      </button>
    </div>
    <div class="toolbar-stats">
      <span>{{ stats.words }} words</span>
      <span class="stats-dot">·</span>
      <span>{{ stats.lines }} lines</span>
    </div>
  </div>
</template>

<script setup lang="ts">
export type ToolbarAction = 'bold' | 'italic' | 'h2' | 'h3' | 'link' | 'table' | 'clean'
export type MediaModalMode = 'featured' | 'content'
export interface EditorSelection {
  from: number
  to: number
}

const props = withDefaults(
  defineProps<{
    stats?: { words: number; lines: number }
    captureSelection?: (() => EditorSelection | null) | null
  }>(),
  {
    stats: () => ({ words: 0, lines: 0 }),
    captureSelection: null,
  }
)

const emit = defineEmits<{
  (e: 'action', action: ToolbarAction): void
  (e: 'open-media', mode: MediaModalMode, range: EditorSelection | null): void
  (e: 'open-mdc', range: EditorSelection | null): void
}>()

function openMediaLibrary(): void {
  const range = props.captureSelection ? props.captureSelection() : null
  emit('open-media', 'content', range)
}

function openMdcInspector(): void {
  const range = props.captureSelection ? props.captureSelection() : null
  emit('open-mdc', range)
}
</script>

<style scoped>
.editor-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  min-width: 0;
}

.tool-btn {
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: var(--glass-border);
  color: var(--text-primary);
}

.tool-btn--strong {
  font-weight: 800;
}

.tool-btn--em {
  font-style: italic;
  font-weight: 600;
}

.tool-btn--clean {
  color: var(--accent);
}

.tool-sep {
  width: 1px;
  height: 18px;
  background: var(--glass-border);
  margin: 0 0.25rem;
  flex-shrink: 0;
}

.toolbar-stats {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  font-size: 0.72rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.stats-dot {
  opacity: 0.5;
}
</style>
