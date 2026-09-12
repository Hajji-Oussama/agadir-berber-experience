<template>
  <div class="serp-preview" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="serp-toolbar">
      <span class="serp-caption">Google SERP Preview / معاينة جوجل</span>
      <div class="serp-toggle" role="group" aria-label="Device preview">
        <button
          type="button"
          class="serp-device"
          :class="{ 'serp-device--active': device === 'desktop' }"
          @click="device = 'desktop'"
        >
          Desktop 💻
        </button>
        <button
          type="button"
          class="serp-device"
          :class="{ 'serp-device--active': device === 'mobile' }"
          @click="device = 'mobile'"
        >
          Mobile 📱
        </button>
      </div>
    </div>

    <div class="serp-result" :class="`serp-result--${device}`">
      <div class="serp-brand-row">
        <img src="/favicon.png" alt="" class="serp-favicon" width="28" height="28" />
        <div class="serp-brand-text">
          <span class="serp-brand">Agadir Berbère Expérience</span>
          <span class="serp-url">
            https://www.agadirberbereexperience.com › {{ locale }} › blog › {{ slug || '...' }}
          </span>
        </div>
      </div>
      <a class="serp-title" :title="title" @click.prevent>
        {{ displayTitle }}
      </a>
      <p class="serp-snippet">{{ displayDescription }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudioLocale } from '~/composables/admin/useStudio'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    slug?: string
    locale?: StudioLocale
  }>(),
  {
    title: '',
    description: '',
    slug: '',
    locale: 'ar',
  }
)

const device = ref<'desktop' | 'mobile'>('desktop')

const displayTitle = computed(() => {
  const text = (props.title || '').trim()
  if (!text) return '…'
  return text.length > 60 ? text.slice(0, 60).trimEnd() + '…' : text
})

const displayDescription = computed(() => {
  const text = (props.description || '').trim()
  if (!text) return '…'
  return text.length > 160 ? text.slice(0, 160).trimEnd() + '…' : text
})
</script>

<style scoped>
.serp-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: #ffffff;
  color: #202124;
}

.serp-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.serp-caption {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #70757a;
}

.serp-toggle {
  display: flex;
  gap: 0.25rem;
  padding: 0.2rem;
  border-radius: 60px;
  background: #f1f3f4;
}

.serp-device {
  padding: 0.3rem 0.7rem;
  border-radius: 60px;
  border: none;
  background: transparent;
  color: #5f6368;
  font-size: 0.75rem;
  cursor: pointer;
}

.serp-device--active {
  background: #ffffff;
  color: #1a0dab;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.serp-result {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.serp-result--mobile {
  max-width: 360px;
}

.serp-brand-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.serp-favicon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f3f4;
  flex-shrink: 0;
}

.serp-brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.serp-brand {
  font-size: 0.85rem;
  color: #202124;
}

.serp-url {
  font-size: 0.75rem;
  color: #5f6368;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.serp-title {
  font-size: 1.15rem;
  line-height: 1.35;
  color: #1a0dab;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.serp-result--mobile .serp-title {
  font-size: 1rem;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.serp-title:hover {
  text-decoration: underline;
}

.serp-snippet {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #4d5156;
}
</style>
