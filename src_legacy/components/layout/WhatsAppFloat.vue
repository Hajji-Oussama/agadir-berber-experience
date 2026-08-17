<template>
  <div class="whatsapp-container" ref="containerRef">
    <Transition name="tooltip">
      <div v-if="showTooltip" class="whatsapp-tooltip">
        <span class="tooltip-arrow"></span>
        {{ $t('whatsapp.tooltip') }}
      </div>
    </Transition>
    <button
      class="whatsapp-float"
      :class="{ 'whatsapp-float--hidden': isHidden }"
      aria-label="Chat on WhatsApp"
      @click="handleBooking()"
    >
      <i class="fab fa-whatsapp"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBooking } from '@/composables/useBooking'

const { locale } = useI18n()
const { handleBooking } = useBooking()

const showTooltip = ref(false)
const isHidden = ref(false)
const containerRef = ref(null)

let tooltipTimer = null
let footerObserver = null

onMounted(() => {
  tooltipTimer = setTimeout(() => {
    showTooltip.value = true
    setTimeout(() => {
      showTooltip.value = false
    }, 6000)
  }, 5000)

  const footer = document.querySelector('.footer')
  if (footer) {
    footerObserver = new IntersectionObserver(
      ([entry]) => {
        isHidden.value = entry.isIntersecting
      },
      { threshold: 0.3 }
    )
    footerObserver.observe(footer)
  }
})

onBeforeUnmount(() => {
  if (tooltipTimer) clearTimeout(tooltipTimer)
  if (footerObserver) footerObserver.disconnect()
})
</script>

<style scoped lang="scss">
.whatsapp-container {
  position: relative;
  display: inline-block;
}

.whatsapp-tooltip {
  position: fixed;
  bottom: 5rem;
  right: 2.5rem;
  background: rgba(10, 14, 26, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--text-primary);
  padding: 0.7rem 1.2rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 400;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  pointer-events: none;

  .tooltip-arrow {
    position: absolute;
    bottom: -6px;
    right: 1.8rem;
    width: 10px;
    height: 10px;
    background: rgba(10, 14, 26, 0.92);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transform: rotate(45deg);
  }
}

.whatsapp-float {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: #25D366;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  box-shadow: 0 10px 30px rgba(37, 211, 102, 0.4);
  z-index: 9999;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  animation: pulse-whatsapp 2s infinite;
  will-change: transform;

  &:hover {
    transform: scale(1.1) rotate(-5deg);
    box-shadow: 0 15px 40px rgba(37, 211, 102, 0.6);
  }

  &--hidden {
    opacity: 0;
    transform: scale(0.8);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    font-size: 2rem;
    bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
    right: calc(1.5rem + env(safe-area-inset-right, 0px));
  }
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
