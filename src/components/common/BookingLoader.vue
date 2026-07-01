<template>
  <Transition name="loader-fade">
    <div v-if="isBookingLoading" class="booking-loader-overlay">
      <div class="booking-loader-card glass-card">
        <div class="loader-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring spinner-ring--inner"></div>
        </div>
        <p class="loader-text">{{ text }}</p>
        <button class="share-btn" @click="share">
          <i class="fas fa-share-alt"></i>
          <span>{{ shareLabel }}</span>
        </button>
        <Transition name="toast-fade">
          <span v-if="copied" class="share-toast">Copied!</span>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { isBookingLoading } from '@/composables/useBooking'

const { locale } = useI18n()

const copied = ref(false)

const text = computed(() => {
  const messages = {
    en: 'Checking availability...',
    fr: 'Vérification de la disponibilité...',
    ar: 'جاري التحقق من التوفر...'
  }
  return messages[locale.value] || messages.en
})

const shareLabel = computed(() => {
  const messages = {
    en: 'Share with Friends',
    fr: 'Partager avec des amis',
    ar: 'مشاركة مع الأصدقاء'
  }
  return messages[locale.value] || messages.en
})

const shareUrl = 'https://www.agadirberbereexperience.com'
const shareTitle = 'I just booked an amazing adventure in Agadir! Check it out:'

async function share() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Agadir Berbère Expérience',
        text: shareTitle,
        url: shareUrl
      })
    } catch {
      // user cancelled or error — fallback to clipboard
      copyFallback()
    }
  } else {
    copyFallback()
  }
}

function copyFallback() {
  navigator.clipboard.writeText(`${shareTitle} ${shareUrl}`)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
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
  position: relative;
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

.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.4rem;
  border-radius: 60px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  margin-top: -0.3rem;

  i {
    font-size: 0.85rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--accent);
    color: var(--text-primary);
    transform: scale(1.03);
  }
}

.share-toast {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.4rem 1rem;
  border-radius: 60px;
  background: var(--accent);
  color: #000;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
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
