<template>
  <div class="group-promo">
    <div class="group-promo-icon"><i class="fas fa-gift"></i></div>
    <div class="group-promo-content">
      <div class="group-promo-title" v-if="title">{{ title }}</div>
      <div class="group-promo-discount" v-if="savingsText">{{ savingsText }}</div>
      <div class="group-promo-condition" v-if="condition">{{ condition }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  discountAmount?: number
  condition?: string
}>()

const { formatPrice } = useCurrency()

const savingsText = computed(() => {
  if (props.discountAmount == null) return ''
  return `Save ${formatPrice(props.discountAmount)} per person!`
})
</script>

<style scoped>
.group-promo {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(201, 168, 124, 0.14) 0%, rgba(255, 255, 255, 0.03) 100%);
  border: 1px solid rgba(201, 168, 124, 0.5);
  border-left: 4px solid var(--accent);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.group-promo-icon {
  color: var(--accent);
  font-size: 1.9rem;
  flex-shrink: 0;
}

.group-promo-title {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.group-promo-discount {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--accent);
}

.group-promo-condition {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
</style>
