import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  ALLOWED_LOCALES,
  EXPERIENCE_SLUGS,
  contentRoot,
  type AdminLocale,
} from '../../utils/admin/pathGuard'
import { parseArticleFile } from '../../utils/admin/fileOps'
import { requireAdminSession } from '../../utils/admin/authGuard'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asPrice(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const num = Number(value)
    if (Number.isFinite(num) && num > 0) return num
  }
  return null
}

/**
 * Official catalog fallbacks (MAD) — used only when a locale file omits the
 * price. Never mixed across locales: each locale's own file value wins.
 */
const OFFICIAL_PRICES: Record<string, number> = {
  'quad-biking': 400,
  'buggy-off-road': 600,
  'horse-riding': 350,
  'camel-trekking': 300,
  'cooking-class': 350,
  'pottery-workshop': 250,
}

/** Display defaults for vehicle / capacity when frontmatter omits them. */
const CATALOG_META: Record<string, { vehicle: string; seats: string }> = {
  'quad-biking': { vehicle: 'Quad bike', seats: '1 rider (+ child passenger)' },
  'buggy-off-road': { vehicle: 'Buggy', seats: '2-seater' },
  'horse-riding': { vehicle: 'Horse', seats: '1 rider' },
  'camel-trekking': { vehicle: 'Camel', seats: '1 rider' },
  'cooking-class': { vehicle: 'Group class', seats: 'Up to 12 guests' },
  'pottery-workshop': { vehicle: 'Workshop', seats: 'Up to 10 guests' },
}

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
  type: 'experience'
  title: string
  image: string
  price: number | null
  priceEur: number | null
  duration: string
  category: string
  vehicle: string
  seats: string
  availability: AdminLocale[]
  locales: Record<AdminLocale, ExperienceLocaleEntry>
}

/**
 * GET /api/admin/experiences
 * Aggregated catalog of the 6 core adventure tours across en/fr/ar.
 * Each slug carries per-locale entries so the dashboard can render locale
 * availability pills (EN/FR/AR) without mixing locale paths. Strict
 * isolation: only `content/<locale>/experiences/` is ever read here.
 */
export default defineEventHandler(async (event) => {
  try {
    requireAdminSession(event)

    const MAD_TO_EUR = 0.092

    const items: ExperienceCatalogItem[] = []

    for (const slug of EXPERIENCE_SLUGS) {
      const locales = {} as Record<AdminLocale, ExperienceLocaleEntry>
      const available: AdminLocale[] = []

      for (const locale of ALLOWED_LOCALES) {
        const filePath = path.join(contentRoot(), locale, 'experiences', `${slug}.md`)
        const fallback: ExperienceLocaleEntry = {
          exists: false,
          title: '',
          description: '',
          image: '',
          price: null,
          duration: '',
          category: '',
          vehicle: '',
          seats: '',
        }
        try {
          const raw = await readFile(filePath, 'utf8')
          const { metadata } = parseArticleFile(raw)
          locales[locale] = {
            exists: true,
            title: asString(metadata.title),
            description: asString(metadata.description),
            image: asString(metadata.image),
            price: asPrice(metadata.price),
            duration: asString(metadata.duration),
            category: asString(metadata.category),
            vehicle: asString(metadata.vehicle),
            seats: asString(metadata.seats),
          }
          available.push(locale)
        } catch {
          locales[locale] = fallback
        }
      }

      // Display resolution order: en → fr → ar → catalog fallback.
      // Each field is resolved independently from its own locale file.
      const firstPresent = (pick: (e: ExperienceLocaleEntry) => string): string => {
        for (const l of ['en', 'fr', 'ar'] as AdminLocale[]) {
          const v = pick(locales[l])
          if (v) return v
        }
        return ''
      }
      const price =
        locales.en.price ?? locales.fr.price ?? locales.ar.price ?? OFFICIAL_PRICES[slug] ?? null

      items.push({
        slug,
        type: 'experience',
        title: firstPresent((e) => e.title) || slug,
        image: firstPresent((e) => e.image),
        price,
        priceEur: price != null ? Math.round(price * MAD_TO_EUR * 100) / 100 : null,
        duration: firstPresent((e) => e.duration),
        category: firstPresent((e) => e.category),
        vehicle: firstPresent((e) => e.vehicle) || CATALOG_META[slug]?.vehicle || '',
        seats: firstPresent((e) => e.seats) || CATALOG_META[slug]?.seats || '',
        availability: available,
        locales,
      })
    }

    return { success: true, data: { type: 'experience', items } }
  } catch (err) {
    const statusCode =
      typeof (err as { statusCode?: unknown }).statusCode === 'number'
        ? (err as { statusCode: number }).statusCode
        : 500
    setResponseStatus(event, statusCode)
    return {
      success: false,
      error: {
        code: (err as { code?: string }).code ?? 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Unexpected error.',
      },
    }
  }
})
