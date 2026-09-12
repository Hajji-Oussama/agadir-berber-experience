import { resolveSafeContentPath } from '../../utils/admin/pathGuard'
import { validateArticlePayload } from '../../utils/admin/validator'
import { serializeArticleFile, atomicWriteFile } from '../../utils/admin/fileOps'
import { requireAdminSession } from '../../utils/admin/authGuard'

const CANONICAL_KEY_ORDER = ['title', 'description', 'image', 'author', 'date', 'sitemap']

export default defineEventHandler(async (event) => {
  try {
    requireAdminSession(event)
    const body = await readBody<{
      locale?: unknown
      slug?: unknown
      metadata?: unknown
      rawContent?: unknown
    }>(event)

    const locale = body?.locale
    const slug = body?.slug
    const metadata = body?.metadata as Record<string, unknown> | undefined
    const rawContent = body?.rawContent

    if (typeof locale !== 'string' || typeof slug !== 'string') {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Body fields locale and slug are required.' },
      }
    }

    const result = validateArticlePayload(
      locale,
      slug,
      metadata,
      typeof rawContent === 'string' ? rawContent : ''
    )
    if (!result.isValid) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: result.errors.join(' '),
          details: result.errors,
        },
      }
    }

    const targetPath = resolveSafeContentPath(locale, slug)

    // Canonical key order first (validator already applied the author default),
    // then any extra keys preserved to avoid data loss.
    const ordered: Record<string, unknown> = {}
    const source = (metadata ?? {}) as Record<string, unknown>
    for (const key of CANONICAL_KEY_ORDER) {
      if (source[key] !== undefined) ordered[key] = source[key]
    }
    for (const [key, value] of Object.entries(source)) {
      if (!(key in ordered)) ordered[key] = value
    }

    const fileContent = serializeArticleFile(ordered, rawContent as string)
    await atomicWriteFile(targetPath, fileContent)

    return {
      success: true,
      data: {
        path: `content/${locale}/blog/${slug}.md`,
        savedAt: new Date().toISOString(),
        warnings: result.warnings,
      },
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
