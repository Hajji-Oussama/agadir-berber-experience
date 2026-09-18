import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  ALLOWED_LOCALES,
  contentDirFor,
  contentRoot,
  normalizeContentType,
} from '../../utils/admin/pathGuard'
import { parseArticleFile } from '../../utils/admin/fileOps'
import { requireAdminSession } from '../../utils/admin/authGuard'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asPositiveInt(value: unknown, fallback: number): number {
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value)
  return Number.isInteger(num) && (num as number) > 0 ? (num as number) : fallback
}

export default defineEventHandler(async (event) => {
  try {
    requireAdminSession(event)

    const query = getQuery(event)
    const rawPage = Array.isArray(query.page) ? query.page[0] : query.page
    const rawLimit = Array.isArray(query.limit) ? query.limit[0] : query.limit
    const rawLocale = Array.isArray(query.locale) ? query.locale[0] : query.locale
    const rawSearch = Array.isArray(query.search) ? query.search[0] : query.search

    // `type` defaults to `blog` (backward compatible). Each call reads from
    // exactly ONE content directory — blog and experiences states are never
    // mixed or duplicated.
    const contentType = normalizeContentType(
      Array.isArray(query.type) ? query.type[0] : query.type
    )
    const contentDir = contentDirFor(contentType)

    const limit = Math.min(50, asPositiveInt(rawLimit, 10))
    const localeFilter =
      rawLocale === 'ar' || rawLocale === 'en' || rawLocale === 'fr' ? rawLocale : 'all'
    const search = typeof rawSearch === 'string' ? rawSearch.trim().toLowerCase() : ''

    const items: {
      slug: string
      locale: string
      type: string
      title: string
      description: string
      date: string
      image: string
      price: number | null
      duration: string
      category: string
      path: string
    }[] = []

    for (const locale of ALLOWED_LOCALES) {
      const dir = path.join(contentRoot(), locale, contentDir)
      let files: string[] = []
      try {
        files = (await readdir(dir)).filter((f) => f.endsWith('.md'))
      } catch {
        continue
      }
      for (const file of files) {
        try {
          const raw = await readFile(path.join(dir, file), 'utf8')
          const { metadata } = parseArticleFile(raw)
          const title = asString(metadata.title)
          const slug = file.replace(/\.md$/, '')
          if (
            search !== '' &&
            !title.toLowerCase().includes(search) &&
            !slug.toLowerCase().includes(search)
          ) {
            continue
          }
          items.push({
            slug,
            locale,
            type: contentType,
            title,
            description: asString(metadata.description),
            date: asString(metadata.date),
            image: asString(metadata.image),
            price:
              typeof metadata.price === 'number'
                ? metadata.price
                : Number(metadata.price) || null,
            duration: asString(metadata.duration),
            category: asString(metadata.category),
            path: `content/${locale}/${contentDir}/${file}`,
          })
        } catch {
          continue
        }
      }
    }

    items.sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        a.locale.localeCompare(b.locale) ||
        a.slug.localeCompare(b.slug)
    )

    const counts = {
      total: items.length,
      ar: items.filter((i) => i.locale === 'ar').length,
      en: items.filter((i) => i.locale === 'en').length,
      fr: items.filter((i) => i.locale === 'fr').length,
    }

    const filtered =
      localeFilter === 'all' ? items : items.filter((i) => i.locale === localeFilter)
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const currentPage = Math.min(Math.max(1, asPositiveInt(rawPage, 1)), totalPages)
    const pageItems = filtered.slice((currentPage - 1) * limit, currentPage * limit)

    return {
      success: true,
      data: { items: pageItems, total, totalPages, currentPage, counts, type: contentType },
    }
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
