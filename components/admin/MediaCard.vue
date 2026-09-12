<template>
  <div
    class="media-card"
    :class="{ 'media-card--selected': isSelected }"
    role="button"
    tabindex="0"
    :aria-pressed="isSelected"
    @click="emit('select')"
    @keydown.enter="emit('select')"
    @keydown.space.prevent="emit('select')"
  >
    <div class="media-thumb">
      <img :src="item.url" :alt="item.filename" loading="lazy" />
      <span class="media-source">{{ item.isLocal ? 'محلي / Local' : 'Cloudinary' }}</span>
      <span v-if="isSelected && selectionIndex != null" class="media-order">
        {{ selectionIndex }}
      </span>
      <button
        type="button"
        class="media-copy"
        title="Copy link / نسخ الرابط"
        @click.stop="onCopy"
      >
        نسخ الرابط 📋
      </button>
      <span v-if="copied" class="media-copied">✓</span>
    </div>
    <div class="media-name" :title="item.filename">{{ item.filename }}</div>
  </div>
</template>

<script setup lang="ts">
export interface MediaItem {
  filename: string
  url: string
  isLocal?: boolean
}

const props = withDefaults(
  defineProps<{
    item: MediaItem
    isSelected?: boolean
    selectionIndex?: number | null
    selectable?: boolean
  }>(),
  {
    isSelected: false,
    selectionIndex: null,
    selectable: true,
  }
)

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'copy', url: string): void
}>()

const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

async function onCopy(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(props.item.url)
    }
  } catch {
    // Clipboard API may be unavailable (non-secure context); the copy
    // event below still fires so parents can react.
  }
  copied.value = true
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, 1500)
  emit('copy', props.item.url)
}

onBeforeUnmount(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>

<style scoped>
.media-card {
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.media-card:hover {
  transform: translateY(-2px);
  border-color: rgba(201, 168, 124, 0.55);
}

.media-card--selected {
  border: 2px solid var(--accent);
  box-shadow: 0 0 18px rgba(201, 168, 124, 0.35);
}

.media-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.media-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-source {
  position: absolute;
  top: 0.4rem;
  inset-inline-start: 0.4rem;
  padding: 0.15rem 0.55rem;
  border-radius: 60px;
  background: rgba(0, 0, 0, 0.65);
  color: var(--text-primary);
  font-size: 0.68rem;
}

.media-order {
  position: absolute;
  top: 0.4rem;
  inset-inline-end: 0.4rem;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  font-size: 0.8rem;
  font-weight: 700;
}

.media-copy {
  position: absolute;
  bottom: 0.4rem;
  inset-inline-end: 0.4rem;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.65);
  color: var(--text-primary);
  font-size: 0.68rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.media-card:hover .media-copy,
.media-card:focus-within .media-copy {
  opacity: 1;
}

.media-copied {
  position: absolute;
  bottom: 0.4rem;
  inset-inline-start: 0.4rem;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  background: rgba(52, 211, 153, 0.85);
  color: #000;
  font-size: 0.75rem;
  font-weight: 700;
}

.media-name {
  padding: 0.45rem 0.6rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, Consolas, monospace;
}
</style>
