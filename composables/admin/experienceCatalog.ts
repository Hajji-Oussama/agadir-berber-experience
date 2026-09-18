import type { StudioLocale } from '~/composables/admin/useStudio'

export interface ExperienceLocaleEntry {
  exists: boolean
  title: string
  description: string
  image: string
  price: number | null
  duration: string
  category: string
  vehicle: string
  seats: string
}

export interface ExperienceCatalogItem {
  slug: string
  type: string
  title: string
  image: string
  price: number | null
  priceEur: number | null
  duration: string
  category: string
  vehicle: string
  seats: string
  availability: StudioLocale[]
  locales: Record<StudioLocale, ExperienceLocaleEntry>
}

export function localeFlag(locale: StudioLocale): string {
  if (locale === 'ar') return '🇸🇦'
  if (locale === 'fr') return '🇫🇷'
  return '🇬🇧'
}

export function primaryExpLocale(exp: ExperienceCatalogItem): StudioLocale {
  if (exp.availability?.includes('en')) return 'en'
  if (exp.availability?.includes('fr')) return 'fr'
  if (exp.availability?.includes('ar')) return 'ar'
  return 'en'
}
