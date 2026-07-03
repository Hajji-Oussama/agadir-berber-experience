import { ref } from 'vue'
import siteConfig from '@/data/siteConfig.json'
import { useCurrency } from '@/composables/useCurrency'

const WHATSAPP_NUMBER = siteConfig.whatsapp.number
export const isBookingLoading = ref(false)
let bookingTimer = null

export function useBooking() {
  const { formatPrice, activeCurrency } = useCurrency()

  function firePixel(item) {
    const pixelPayload = {
      content_name: item?.name || item?.title || 'Bourmi Trip',
      currency: activeCurrency.value
    }
    if (item?.price) {
      pixelPayload.value = typeof item.price === 'string'
        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
        : item.price
    }
    if (window.fbq) {
      window.fbq('track', 'Lead', pixelPayload)
    }
  }

  function buildWhatsAppUrl(item) {
    const name = item?.name || item?.title || 'an adventure'
    const price = item?.price
      ? ` ${formatPrice(item.price)}`
      : ''
    const params = new URLSearchParams(window.location.search)
    const refParts = []
    const utmSource = params.get('utm_source')
    const utmCampaign = params.get('utm_campaign')
    const utmMedium = params.get('utm_medium')
    const fbclid = params.get('fbclid')
    if (fbclid) refParts.push(`fb:${fbclid.slice(0, 12)}`)
    if (utmSource) refParts.push(utmSource)
    if (utmCampaign) refParts.push(utmCampaign)
    if (utmMedium) refParts.push(utmMedium)
    const ref = refParts.length ? ` [Ref: ${refParts.join('|')}]` : ''
    const text = `Hello, I want to book the ${name} for${price}${ref} \n\n📍 See details: ${siteConfig.website}`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  }

  function handleBooking(item = null) {
    firePixel(item)
    const url = buildWhatsAppUrl(item)
    if (bookingTimer) clearTimeout(bookingTimer)
    isBookingLoading.value = true

    // 1. Fire the Pixel instantly
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', 'WhatsAppClick')
    }

    // 2. Redirect instantly using location.href to bypass iOS Safari Popup Blocker
    window.location.href = url

    // 3. Reset the loading state after a delay (in case the user navigates back to the page)
    bookingTimer = setTimeout(() => {
      isBookingLoading.value = false
      bookingTimer = null
    }, 1000)
  }

  return { handleBooking, isBookingLoading }
}
