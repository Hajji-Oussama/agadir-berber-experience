<template>
  <div class="lang-switcher">
    <button
      v-for="lang in languages"
      :key="lang.code"
      :class="['lang-btn', { active: locale === lang.code }]"
      @click="switchLanguage(lang.code)"
      :aria-label="lang.label"
    >
      {{ lang.flag }}
    </button>
  </div>
</template>

<script setup>
import { useLanguage } from '@/composables/useLanguage'

const { locale, switchLanguage } = useLanguage()

const languages = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' }
]
</script>

<style scoped lang="scss">
.lang-switcher {
  display: flex;
  gap: 0.3rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  padding: 0.3rem;
  border-radius: 60px;
  border: 1px solid var(--glass-border);
}

.lang-btn {
  background: transparent;
  border: none;
  font-size: 1.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.6;
  transform: scale(0.9);
  line-height: 1;
  color: var(--text-primary);

  &.active {
    opacity: 1;
    transform: scale(1);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 20px rgba(201, 168, 124, 0.3);
  }

  &:hover:not(.active) {
    opacity: 0.9;
    transform: scale(0.95);
  }
}
</style>
