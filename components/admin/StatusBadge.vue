<template>
  <button
    type="button"
    class="status-badge"
    :class="`status-badge--${status}`"
    :title="status === 'error' && errorMessage ? errorMessage : undefined"
    @click="expanded = status === 'error' ? !expanded : expanded"
  >
    <span class="status-dot" aria-hidden="true"></span>
    <span class="status-label">{{ label }}</span>
    <span v-if="status === 'error' && errorMessage && expanded" class="status-error">
      {{ errorMessage }}
    </span>
  </button>
</template>

<script setup lang="ts">
import type { SaveStatus } from '~/composables/admin/useStudio'

const props = withDefaults(
  defineProps<{
    status?: SaveStatus
    errorMessage?: string | null
  }>(),
  {
    status: 'saved',
    errorMessage: null,
  }
)

const expanded = ref(false)

const label = computed(() => {
  switch (props.status) {
    case 'saved':
      return 'محفوظ / Saved'
    case 'dirty':
      return 'تعديلات غير محفوظة / Unsaved Changes'
    case 'saving':
      return 'جاري الحفظ... / Saving...'
    case 'error':
      return 'خطأ / Error'
    default:
      return 'محفوظ / Saved'
  }
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
  padding: 0.4rem 0.9rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: default;
  white-space: nowrap;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #9ca3af;
  flex-shrink: 0;
}

.status-badge--saved .status-dot {
  background: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.8);
  animation: status-pulse 2s ease-in-out infinite;
}

.status-badge--saved {
  border-color: rgba(52, 211, 153, 0.4);
  color: #a7f3d0;
}

.status-badge--dirty .status-dot {
  background: #fbbf24;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
}

.status-badge--dirty {
  border-color: rgba(251, 191, 36, 0.5);
  color: #fde68a;
}

.status-badge--saving .status-dot {
  background: #60a5fa;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.8);
  animation: status-spin 1s linear infinite;
}

.status-badge--saving {
  border-color: rgba(96, 165, 250, 0.5);
  color: #bfdbfe;
}

.status-badge--error {
  border-color: rgba(248, 113, 113, 0.55);
  color: #fecaca;
  cursor: pointer;
}

.status-badge--error .status-dot {
  background: #f87171;
  box-shadow: 0 0 10px rgba(248, 113, 113, 0.8);
}

.status-error {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  opacity: 0.9;
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(0.85);
  }
}

@keyframes status-spin {
  from {
    transform: rotate(0deg) scale(1);
  }
  to {
    transform: rotate(360deg) scale(1);
  }
}
</style>
