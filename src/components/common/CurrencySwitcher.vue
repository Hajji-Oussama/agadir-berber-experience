<template>
  <div class="currency-switcher">
    <button
      v-for="cur in currencies"
      :key="cur.code"
      :class="['currency-btn', { active: activeCurrency === cur.code }]"
      @click="activeCurrency = cur.code"
      :aria-label="cur.label"
    >
      {{ cur.code }}
    </button>
  </div>
</template>

<script setup>
import { useCurrency } from '@/composables/useCurrency'

const { activeCurrency } = useCurrency()

const currencies = [
  { code: 'EUR', symbol: '\u20AC', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'MAD', symbol: 'MAD', label: 'Moroccan Dirham' }
]
</script>

<style scoped lang="scss">
.currency-switcher {
  display: inline-flex;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px;
  border-radius: 8px;
  gap: 1px;
}

.currency-btn {
  background: transparent;
  border: none;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
  color: var(--text-secondary);
  font-family: inherit;
  line-height: 1.4;
  white-space: nowrap;

  &.active {
    background: var(--accent);
    color: #000;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }

  &:hover:not(.active) {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.06);
  }
}
</style>
