import { ref } from 'vue'

const WHATSAPP_NUMBER = '+212615884469'
export const isBookingLoading = ref(false)
let bookingTimer = null

export function useBooking() {
  function firePixel(item) {
    const pixelPayload = {
      content_name: item?.name || item?.title || 'Bourmi Trip',
      currency: 'MAD'
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
      ? ` ${item.price} Dhs`
      : ''
    const text = `Hello, I want to book the ${name} for${price}`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  }

  function handleBooking(item = null) {
    firePixel(item)
    const url = buildWhatsAppUrl(item)
    if (bookingTimer) clearTimeout(bookingTimer)
    isBookingLoading.value = true
    bookingTimer = setTimeout(() => {
      isBookingLoading.value = false
      bookingTimer = null
      window.open(url, '_blank', 'noopener,noreferrer')
    }, 1500)
  }

  return { handleBooking, isBookingLoading }
}
