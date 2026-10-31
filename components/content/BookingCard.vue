<template>
  <div class="booking-card">
    <div class="booking-card-title" v-if="title">{{ title }}</div>
    <div class="booking-card-price" v-if="price">{{ price }}</div>
    <a
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
      class="booking-card-btn"
      @click="handleBookingClick"
    >
      <i class="fab fa-whatsapp"></i>
      {{ $t('services.book_now') }}
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildWhatsAppUrl, isExternalUrl, normalizeLocale } from '~/composables/useWhatsApp'

const props = defineProps<{
  title?: string
  price?: string
  link?: string
}>()

const { locale } = useI18n()

// SSR-safe: crawlers / no-JS users get a valid wa.me href at render time.
// - External `link` (http… / https://wa.me…) is used verbatim.
// - Internal route or missing `link` auto-builds a localized WhatsApp URL.
const href = computed(() => {
  if (props.link && isExternalUrl(props.link)) return props.link.trim()
  return buildWhatsAppUrl(
    { title: props.title, price: props.price },
    normalizeLocale(locale.value),
  )
})

// Google Ads click conversion (AW-18442780708). Fires on the WhatsApp button,
// then redirects once the event has been handed to gtag.
const CONVERSION_SEND_TO = 'AW-18442780708/RLcWCMzOwq8dEKSAmtpE'

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void }

function gtag_report_conversion(url: string) {
  const callback = function () {
    if (typeof url !== 'undefined' && url) {
      window.location.href = url
    }
  }

  const gtagWindow = window as GtagWindow
  if (import.meta.client && typeof gtagWindow.gtag === 'function') {
    gtagWindow.gtag('event', 'conversion', {
      send_to: CONVERSION_SEND_TO,
      value: 1.0,
      currency: 'MAD',
      event_callback: callback,
    })
  }
  else {
    callback()
  }
  return false
}

function handleBookingClick(event: MouseEvent) {
  // Prevent the default link navigation so the conversion fires first.
  event.preventDefault()
  gtag_report_conversion(href.value)
}
</script>

<style scoped>
.booking-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  background-image: linear-gradient(135deg, rgba(201, 168, 124, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 168, 124, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.booking-card-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--text-primary);
}

.booking-card-price {
  font-family: var(--font-heading);
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--accent);
  line-height: 1;
}

.booking-card-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.85rem 2rem;
  min-height: 48px;
  border-radius: 60px;
  background: #25D366;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.3);

  i {
    font-size: 1.15rem;
  }

  &:hover {
    background: #20bd5a;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 30px rgba(37, 211, 102, 0.45);
  }

  &--disabled {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);
    box-shadow: none;
    cursor: default;
  }
}
</style>
