<template>
  <div class="seo-meter" :class="`seo-meter--${state}`">
    <div class="seo-meter-top">
      <span class="seo-label">{{ label }}</span>
      <span class="seo-pill">{{ currentLength }}/{{ maxOptimal }}</span>
    </div>
    <div class="seo-bar" role="progressbar" :aria-valuenow="currentLength" :aria-valuemin="0" :aria-valuemax="scaleMax">
      <div class="seo-fill" :style="{ width: fillPercent + '%' }"></div>
    </div>
    <span class="seo-state">{{ stateLabel }}</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentLength: number
    minOptimal: number
    maxOptimal: number
    maxAllowed?: number
    label?: string
  }>(),
  {
    maxAllowed: 0,
    label: 'الحروف / Characters',
  }
)

type MeterState = 'short' | 'optimal' | 'long'

const state = computed((): MeterState => {
  if (props.currentLength < props.minOptimal) return 'short'
  if (props.currentLength > props.maxOptimal) return 'long'
  return 'optimal'
})

const stateLabel = computed(() => {
  if (state.value === 'short') return 'قصير / Too short'
  if (state.value === 'long') return 'طويل جداً / Too long - will truncate'
  return 'مثالي / Optimal'
})

const scaleMax = computed(() => (props.maxAllowed > 0 ? props.maxAllowed : props.maxOptimal))

const fillPercent = computed(() => {
  if (scaleMax.value <= 0) return 0
  return Math.min(100, Math.round((props.currentLength / scaleMax.value) * 100))
})
</script>

<style scoped>
.seo-meter {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.4rem;
}

.seo-meter-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.seo-label {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.seo-pill {
  padding: 0.15rem 0.6rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.seo-bar {
  height: 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.seo-fill {
  height: 100%;
  border-radius: 4px;
  background: #fbbf24;
  transition: width 0.25s ease, background 0.25s ease;
}

.seo-state {
  font-size: 0.72rem;
  font-weight: 500;
  color: #fbbf24;
}

.seo-meter--optimal .seo-fill {
  background: #34d399;
  box-shadow: 0 0 12px rgba(52, 211, 153, 0.6);
}

.seo-meter--optimal .seo-state,
.seo-meter--optimal .seo-pill {
  color: #a7f3d0;
}

.seo-meter--long .seo-fill {
  background: #fb7185;
}

.seo-meter--long .seo-state,
.seo-meter--long .seo-pill {
  color: #fecaca;
}
</style>
