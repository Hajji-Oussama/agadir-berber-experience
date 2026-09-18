import { ALLOWED_LOCALES, normalizeContentType, routeSegmentFor } from './pathGuard'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

const SLUG_PATTERN = /^[a-z0-9-]+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TITLE_MIN = 40
const TITLE_MAX = 60
const DESCRIPTION_MIN = 150
const DESCRIPTION_MAX = 160
const DEFAULT_AUTHOR = 'Agadir Berbère Team'

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isRealCalendarDate(date: string): boolean {
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m || !d) return false
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

function isValidImageRef(value: string): boolean {
  return (
    value.startsWith('/images/blog/') ||
    value.startsWith('/images/experiences/') ||
    value.startsWith('https://res.cloudinary.com/')
  )
}

function isPositivePrice(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0
  if (typeof value === 'string' && value.trim() !== '') {
    const num = Number(value)
    return Number.isFinite(num) && num > 0
  }
  return false
}

/**
 * Validate article/experience metadata against the project's content standards.
 * Hard failures go to `errors` (blocking); length recommendations go to
 * `warnings` (advisory only). Applies the default author in place when
 * missing (blog only). `isValid` is true whenever `errors` is empty,
 * regardless of warnings.
 *
 * `contentType` defaults to `blog` for backward compatibility:
 * - blog: title / description / image / author / date / sitemap.loc required.
 * - experience: title / description / image / price (MAD) / duration /
 *   sitemap.loc required; author & date optional; `gallery` (string array),
 *   `category`, `vehicle`/`seats` accepted as optional extras.
 */
export function validateArticlePayload(
  locale: string,
  slug: string,
  metadata: Record<string, unknown> | null | undefined,
  rawContent: string,
  contentTypeRaw: unknown = 'blog'
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  let contentType: 'blog' | 'experience' = 'blog'
  try {
    contentType = normalizeContentType(contentTypeRaw)
  } catch {
    errors.push('type: must be strictly one of blog, experience.')
    contentType = 'blog'
  }
  const isExperience = contentType === 'experience'
  const routeSegment = routeSegmentFor(contentType)

  if (typeof locale !== 'string' || !(ALLOWED_LOCALES as readonly string[]).includes(locale)) {
    errors.push('locale: must be strictly one of ar, en, fr.')
  }

  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
    errors.push('slug: must be lowercase alphanumeric with hyphens only (^[a-z0-9-]+$).')
  }

  if (metadata == null || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {
      isValid: false,
      errors: [...errors, 'metadata: must be a plain object.'],
      warnings,
    }
  }
  const meta = metadata as Record<string, unknown>

  if (!isNonEmptyString(meta.title)) {
    errors.push('title: string, required.')
  } else if (meta.title.trim().length < TITLE_MIN || meta.title.trim().length > TITLE_MAX) {
    warnings.push(
      `title recommended ${TITLE_MIN}-${TITLE_MAX} chars (got ${meta.title.trim().length}).`
    )
  }

  if (!isNonEmptyString(meta.description)) {
    errors.push('description: string, required.')
  } else if (
    meta.description.trim().length < DESCRIPTION_MIN ||
    meta.description.trim().length > DESCRIPTION_MAX
  ) {
    warnings.push(
      `description recommended ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} chars (got ${meta.description.trim().length}).`
    )
  }

  if (!isNonEmptyString(meta.image)) {
    errors.push('image: string, required.')
  } else if (!isValidImageRef(meta.image)) {
    errors.push(
      'image: must start with /images/blog/, /images/experiences/ or https://res.cloudinary.com/.'
    )
  }

  if (isExperience) {
    // ---- Experience-specific frontmatter ----
    if (!isPositivePrice(meta.price)) {
      errors.push('price: positive number (MAD), required for experiences.')
    }
    if (!isNonEmptyString(meta.duration)) {
      errors.push('duration: string (e.g. "2 hours"), required for experiences.')
    }
    if (
      meta.gallery !== undefined &&
      (!Array.isArray(meta.gallery) ||
        !meta.gallery.every((g) => typeof g === 'string' && g.trim() !== ''))
    ) {
      errors.push('gallery: must be an array of non-empty image URL strings.')
    } else if (Array.isArray(meta.gallery)) {
      for (const g of meta.gallery) {
        if (!isValidImageRef(g as string)) {
          errors.push(
            'gallery: every entry must start with /images/blog/, /images/experiences/ or https://res.cloudinary.com/.'
          )
          break
        }
      }
    }
    for (const key of ['category', 'vehicle', 'seats']) {
      if (meta[key] !== undefined && typeof meta[key] !== 'string') {
        errors.push(`${key}: must be a string.`)
      }
    }
    if (meta.date !== undefined && meta.date !== '' && typeof meta.date === 'string') {
      const d = meta.date.trim()
      if (d !== '' && (!DATE_PATTERN.test(d) || !isRealCalendarDate(d))) {
        errors.push('date: must be a real calendar date in YYYY-MM-DD format.')
      }
    }
  } else {
    // ---- Blog-specific frontmatter ----
    if (meta.author == null || (typeof meta.author === 'string' && meta.author.trim() === '')) {
      meta.author = DEFAULT_AUTHOR
    } else if (typeof meta.author !== 'string') {
      errors.push('author: must be a string.')
    }

    if (!isNonEmptyString(meta.date)) {
      errors.push('date: string, required, format YYYY-MM-DD.')
    } else if (!DATE_PATTERN.test(meta.date.trim()) || !isRealCalendarDate(meta.date.trim())) {
      errors.push('date: must be a real calendar date in YYYY-MM-DD format.')
    }
  }

  const expectedLoc = `/${locale}/${routeSegment}/${slug}`
  const sitemap = meta.sitemap as Record<string, unknown> | undefined
  if (
    sitemap == null ||
    typeof sitemap !== 'object' ||
    (sitemap as Record<string, unknown>).loc !== expectedLoc
  ) {
    errors.push(`sitemap.loc: must strictly match ${expectedLoc}.`)
  }

  if (typeof rawContent !== 'string' || rawContent.trim() === '') {
    errors.push('rawContent: must be a non-empty string.')
  }

  return { isValid: errors.length === 0, errors, warnings }
}
