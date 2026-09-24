import { useCurrency } from '~/composables/useCurrency'
import {
  buildWhatsAppUrl as buildLocalizedWhatsAppUrl,
  normalizeLocale,
  type WhatsAppBookingInput,
} from '~/composables/useWhatsApp'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

export type BookingItem = WhatsAppBookingInput

export const isBookingLoading = ref(false)
let bookingTimer: ReturnType<typeof setTimeout> | null = null

function resolveLocale(explicit?: unknown): 'en' | 'fr' | 'ar' {
  if (explicit) return normalizeLocale(explicit)
  try {
    return normalizeLocale(useI18n().locale.value)
  }
  catch {
    return 'en'
  }
}

export function useBooking() {
  const { activeCurrency } = useCurrency()
  const bookingLocale = resolveLocale()

  function firePixel(item: BookingItem | null) {
    const pixelPayload: Record<string, unknown> = {
      content_name: item?.name || item?.title || 'Bourmi Trip',
      currency: activeCurrency.value
    }
    if (item?.price) {
      pixelPayload.value = typeof item.price === 'string'
        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
        : item.price
    }
    if (import.meta.client && window.fbq) {
      window.fbq('track', 'Lead', pixelPayload)
    }
  }

  /** Localized, SSR-safe wa.me URL (delegates to useWhatsApp; preserves UTM/promo suffixes). */
  function buildWhatsAppUrl(item: BookingItem | null = null, localeOverride?: unknown) {
    return buildLocalizedWhatsAppUrl(item, localeOverride ?? bookingLocale)
  }

  function handleBooking(item: BookingItem | null = null, localeOverride?: unknown) {
    if (!import.meta.client) return
    firePixel(item)
    const url = buildWhatsAppUrl(item, localeOverride ?? bookingLocale)
    if (bookingTimer) clearTimeout(bookingTimer)
    isBookingLoading.value = true

    // 1. Fire tracking instantly (Meta Pixel + Google Ads/GA4 if loaded)
    if (window.fbq) {
      window.fbq('trackCustom', 'WhatsAppClick')
    }
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'generate_lead', {
          method: 'whatsapp',
          content_name: item?.name || item?.title || 'general',
        })
      }
      catch { /* never block redirect on analytics failure */ }
    }

    // 2. Redirect instantly using location.href to bypass iOS Safari Popup Blocker
    window.location.href = url

    // 3. Reset the loading state after a delay (in case the user navigates back)
    bookingTimer = setTimeout(() => {
      isBookingLoading.value = false
      bookingTimer = null
    }, 1000)
  }

  return { handleBooking, buildWhatsAppUrl, isBookingLoading }
}
