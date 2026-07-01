<template>
  <Transition name="loader-fade">
    <div v-if="isBookingLoading" class="booking-loader-overlay">
      <div class="booking-loader-card glass-card">
        <div class="loader-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring spinner-ring--inner"></div>
        </div>
        <p class="loader-text">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { isBookingLoading } from '@/composables/useBooking'

const { locale } = useI18n()

const text = computed(() => {
  const messages = {
    en: 'Checking availability...',
    fr: 'Vérification de la disponibilité...',
    ar: 'جاري التحقق من التوفر...'
  }
  return messages[locale.value] || messages.en
})
</script>

<style scoped lang="scss">
.booking-loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 26, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.booking-loader-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2.5rem 3.5rem;
  border-radius: 24px;
  background: rgba(10, 14, 26, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
}

.loader-spinner {
  position: relative;
  width: 56px;
  height: 56px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.6, 0, 0.4, 1) infinite;
}

.spinner-ring--inner {
  inset: 8px;
  border-top-color: rgba(255, 255, 255, 0.3);
  animation-duration: 0.75s;
  animation-direction: reverse;
}

.loader-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  margin: 0;
  white-space: nowrap;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>
