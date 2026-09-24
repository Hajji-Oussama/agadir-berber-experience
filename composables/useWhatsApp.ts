import siteConfig from '~/data/siteConfig.json'
import promoConfig from '~/data/promoConfig.json'
import { useCurrency } from '~/composables/useCurrency'

export type SupportedLocale = 'en' | 'fr' | 'ar'

export interface WhatsAppBookingInput {
  id?: string
  name?: string
  title?: string
  price?: number | string
  /** Optional free-text details (e.g. date). Appended to EN template via "for {details}". */
  details?: string
  /** Optional canonical/details URL appended as "See details: {url}". */
  url?: string
}

const RAW_NUMBER: string =
  (siteConfig as { whatsapp?: { number?: string } }).whatsapp?.number ?? '+212615884469'

/** wa.me requires digits only — strip "+", spaces, dashes. */
export const WHATSAPP_NUMBER_DIGITS = RAW_NUMBER.replace(/\D/g, '')

export function normalizeLocale(input: unknown): SupportedLocale {
  const v = String(input ?? 'en').toLowerCase()
  if (v.startsWith('ar')) return 'ar'
  if (v.startsWith('fr')) return 'fr'
  return 'en'
}

function fallbackTitle(locale: SupportedLocale): string {
  if (locale === 'fr') return 'une expérience'
  if (locale === 'ar') return 'تجربة'
  return 'an adventure'
}

function resolveTitle(input: WhatsAppBookingInput | null, locale: SupportedLocale): string {
  const raw = (input?.name || input?.title || '').trim()
  return raw || fallbackTitle(locale)
}

function resolvePrice(input: WhatsAppBookingInput | null): string {
  if (!input?.price && input?.price !== 0) return ''
  if (typeof input.price === 'number') {
    try {
      return useCurrency().formatPrice(input.price)
    }
    catch {
      return String(input.price)
    }
  }
  return String(input.price).trim()
}

/**
 * Localized base message (spec templates):
 * EN: "Hello Agadir Berbère Expérience, I would like to book the {title} ({price}) for {date/details}."
 * FR: "Bonjour Agadir Berbère Expérience, je souhaite réserver l'expérience {title} ({price})."
 * AR: "السلام عليكم Agadir Berbère Expérience، أريد حجز تجربة {title} بسعر {price}."
 * Missing title/price degrade cleanly (no empty parentheses).
 */
export function buildWhatsAppMessage(
  input: WhatsAppBookingInput | null = null,
  localeInput: unknown = 'en',
): string {
  const locale = normalizeLocale(localeInput)
  const title = resolveTitle(input, locale)
  const price = resolvePrice(input)
  const details = input?.details?.trim() ?? ''

  if (locale === 'fr') {
    return `Bonjour Agadir Berbère Expérience, je souhaite réserver l'expérience ${title}${price ? ` (${price})` : ''}.`
  }
  if (locale === 'ar') {
    return `السلام عليكم Agadir Berbère Expérience، أريد حجز تجربة ${title}${price ? ` بسعر ${price}` : ''}.`
  }
  return `Hello Agadir Berbère Expérience, I would like to book the ${title}${price ? ` (${price})` : ''}${details ? ` for ${details}` : ''}.`
}

/** Client-only attribution (UTM/fbclid) — empty string on SSR so crawler href stays valid. */
function getRefSuffix(): string {
  if (!import.meta.client) return ''
  try {
    const params = new URLSearchParams(window.location.search)
    const parts: string[] = []
    const fbclid = params.get('fbclid')
    const utmSource = params.get('utm_source')
    const utmCampaign = params.get('utm_campaign')
    const utmMedium = params.get('utm_medium')
    if (fbclid) parts.push(`fb:${fbclid.slice(0, 12)}`)
    if (utmSource) parts.push(utmSource)
    if (utmCampaign) parts.push(utmCampaign)
    if (utmMedium) parts.push(utmMedium)
    return parts.length ? ` [Ref: ${parts.join('|')}]` : ''
  }
  catch {
    return ''
  }
}

function getPromoSuffix(input: WhatsAppBookingInput | null): string {
  try {
    if (promoConfig?.isActive && input?.id && input.id === promoConfig.serviceId)
      return ' [Moroccan Promo Claimed]'
  }
  catch { /* ignore */ }
  return ''
}

/** Full localized message + attribution suffixes + optional details URL. */
export function buildFullBookingText(
  input: WhatsAppBookingInput | null = null,
  localeInput: unknown = 'en',
): string {
  const base = buildWhatsAppMessage(input, localeInput)
  const ref = getRefSuffix()
  const promo = getPromoSuffix(input)
  const url = input?.url?.trim() ? `\n\nSee details: ${input.url.trim()}` : ''
  return `${base}${ref}${promo}${url}`
}

/** SSR-safe: returns a direct https://wa.me/... link usable as <a href>. */
export function buildWhatsAppUrl(
  input: WhatsAppBookingInput | null = null,
  localeInput: unknown = 'en',
): string {
  return `https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=${encodeURIComponent(buildFullBookingText(input, localeInput))}`
}

export function getGeneralInquiryMessage(localeInput: unknown = 'en'): string {
  const locale = normalizeLocale(localeInput)
  if (locale === 'fr') return 'Bonjour Agadir Berbère Expérience, j\'ai besoin d\'aide pour réserver une expérience.'
  if (locale === 'ar') return 'السلام عليكم Agadir Berbère Expérience، أحتاج مساعدة في حجز تجربة.'
  return 'Hello Agadir Berbère Expérience, I need help booking an experience.'
}

export function getGeneralInquiryUrl(localeInput: unknown = 'en'): string {
  return `https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=${encodeURIComponent(getGeneralInquiryMessage(localeInput))}`
}

export function isExternalUrl(link: unknown): boolean {
  return typeof link === 'string' && /^https?:\/\//i.test(link.trim())
}

export function useWhatsApp() {
  let currentLocale: SupportedLocale = 'en'
  try {
    currentLocale = normalizeLocale(useI18n().locale.value)
  }
  catch { /* outside setup — default en */ }

  const generalInquiryUrl = computed(() => getGeneralInquiryUrl(currentLocale))

  return {
    whatsappNumber: WHATSAPP_NUMBER_DIGITS,
    locale: currentLocale,
    buildWhatsAppMessage,
    buildWhatsAppUrl,
    buildFullBookingText,
    getGeneralInquiryMessage,
    getGeneralInquiryUrl,
    generalInquiryUrl,
    isExternalUrl,
  }
}
