import siteConfig from '~/data/siteConfig.json'
import promoConfig from '~/data/promoConfig.json'
import { useCurrency } from '~/composables/useCurrency'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

const WHATSAPP_NUMBER = siteConfig.whatsapp.number
export const isBookingLoading = ref(false)
let bookingTimer: ReturnType<typeof setTimeout> | null = null

export function useBooking() {
  const { formatPrice, activeCurrency } = useCurrency()

  function firePixel(item: { name?: string; title?: string; price?: number | string } | null) {
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

  function buildWhatsAppUrl(item: { id?: string; name?: string; title?: string; price?: number | string } | null = null) {
    const name = item?.name || item?.title || 'an adventure'
    const price = item?.price ? ` ${formatPrice(item.price)}` : ''
    const query = import.meta.client ? window.location.search : ''
    const params = new URLSearchParams(query)
    const refParts: string[] = []
    const utmSource = params.get('utm_source')
    const utmCampaign = params.get('utm_campaign')
    const utmMedium = params.get('utm_medium')
    const fbclid = params.get('fbclid')
    if (fbclid) refParts.push(`fb:${fbclid.slice(0, 12)}`)
    if (utmSource) refParts.push(utmSource)
    if (utmCampaign) refParts.push(utmCampaign)
    if (utmMedium) refParts.push(utmMedium)
    const ref = refParts.length ? ` [Ref: ${refParts.join('|')}]` : ''
    const promoFlag = promoConfig.isActive && item?.id === promoConfig.serviceId ? ' [Moroccan Promo Claimed]' : ''
    const text = `Hello, I want to book the ${name} for${price}${ref}${promoFlag} \n\n\uD83D\uDCCD See details: ${siteConfig.website}`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  }

  function handleBooking(item: { id?: string; name?: string; title?: string; price?: number | string } | null = null) {
    if (!import.meta.client) return
    firePixel(item)
    const url = buildWhatsAppUrl(item)
    if (bookingTimer) clearTimeout(bookingTimer)
    isBookingLoading.value = true

    // 1. Fire the Pixel instantly
    if (window.fbq) {
      window.fbq('trackCustom', 'WhatsAppClick')
    }

    // 2. Redirect instantly using location.href to bypass iOS Safari Popup Blocker
    window.location.href = url

    // 3. Reset the loading state after a delay (in case the user navigates back)
    bookingTimer = setTimeout(() => {
      isBookingLoading.value = false
      bookingTimer = null
    }, 1000)
  }

  return { handleBooking, isBookingLoading }
}
