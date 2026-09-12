<template>
  <div
    ref="rootRef"
    class="split-pane"
    :class="{ 'split-pane--dragging': dragging }"
  >
    <div v-if="isNarrow" class="split-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        class="split-tab"
        :class="{ 'split-tab--active': narrowTab === 'editor' }"
        @click="narrowTab = 'editor'"
      >
        Editor
      </button>
      <button
        type="button"
        role="tab"
        class="split-tab"
        :class="{ 'split-tab--active': narrowTab === 'preview' }"
        @click="narrowTab = 'preview'"
      >
        Preview
      </button>
    </div>

    <div class="split-body">
      <section v-if="showLeft" class="pane pane--left" :style="leftStyle">
        <slot name="left" />
      </section>

      <div
        v-if="showResizer"
        class="resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panes"
        @pointerdown="onPointerDown"
      ></div>

      <section v-if="showRight" class="pane pane--right" :style="rightStyle">
        <slot name="right" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
export type SplitMode = 'split' | 'editor' | 'preview'

const props = withDefaults(
  defineProps<{
    initialSplit?: number
    minPercent?: number
    maxPercent?: number
    mode?: SplitMode
  }>(),
  {
    initialSplit: 50,
    minPercent: 20,
    maxPercent: 80,
    mode: 'split',
  }
)

const rootRef = ref<HTMLElement | null>(null)
const split = ref(props.initialSplit)
const dragging = ref(false)
const isNarrow = ref(false)
const narrowTab = ref<'editor' | 'preview'>('editor')

let mediaQuery: MediaQueryList | null = null

function clamp(value: number): number {
  return Math.min(props.maxPercent, Math.max(props.minPercent, value))
}

const showLeft = computed(() => {
  if (isNarrow.value) return narrowTab.value === 'editor'
  return props.mode !== 'preview'
})

const showRight = computed(() => {
  if (isNarrow.value) return narrowTab.value === 'preview'
  return props.mode !== 'editor'
})

const showResizer = computed(
  () => !isNarrow.value && props.mode === 'split' && showLeft.value && showRight.value
)

const leftStyle = computed(() =>
  showResizer.value ? { width: `${split.value}%` } : undefined
)
const rightStyle = computed(() =>
  showResizer.value ? { flex: '1 1 0', minWidth: '0' } : undefined
)

function onPointerDown(e: PointerEvent): void {
  if (isNarrow.value) return
  dragging.value = true
  if (typeof document !== 'undefined') {
    document.documentElement.style.userSelect = 'none'
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp, { once: true })
  }
  e.preventDefault()
}

function onPointerMove(e: PointerEvent): void {
  if (!dragging.value || !rootRef.value) return
  const rect = rootRef.value.getBoundingClientRect()
  if (rect.width <= 0) return
  split.value = clamp(((e.clientX - rect.left) / rect.width) * 100)
}

function onPointerUp(): void {
  dragging.value = false
  if (typeof document !== 'undefined') {
    document.documentElement.style.userSelect = ''
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', onPointerMove)
  }
}

function syncNarrow(e?: MediaQueryListEvent): void {
  isNarrow.value = e ? e.matches : (mediaQuery?.matches ?? false)
}

onMounted(() => {
  if (typeof window === 'undefined' || !window.matchMedia) return
  mediaQuery = window.matchMedia('(max-width: 1023.5px)')
  syncNarrow()
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', syncNarrow)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', onPointerMove)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.style.userSelect = ''
  }
  if (mediaQuery?.removeEventListener) {
    mediaQuery.removeEventListener('change', syncNarrow)
  }
  dragging.value = false
})
</script>

<style scoped>
.split-pane {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.split-pane--dragging {
  cursor: col-resize;
}

.split-tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.03);
}

.split-tab {
  flex: 1 1 0;
  padding: 0.55rem;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
}

.split-tab--active {
  background: rgba(201, 168, 124, 0.16);
  border-color: rgba(201, 168, 124, 0.45);
  color: var(--accent);
}

.split-body {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  flex: 1 1 0;
}

.pane--left {
  flex-shrink: 0;
}

.resizer {
  flex: 0 0 8px;
  cursor: col-resize;
  position: relative;
}

.resizer::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 3px;
  width: 2px;
  background: rgba(201, 168, 124, 0.4);
  border-radius: 2px;
  transition: background 0.2s ease;
}

.resizer:hover::after {
  background: var(--accent);
}
</style>
