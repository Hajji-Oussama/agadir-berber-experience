import { readFile } from 'node:fs/promises'
import { resolveSafeContentPath } from '../../utils/admin/pathGuard'
import { parseArticleFile } from '../../utils/admin/fileOps'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const locale = Array.isArray(query.locale) ? query.locale[0] : query.locale
    const slug = Array.isArray(query.slug) ? query.slug[0] : query.slug
    if (typeof locale !== 'string' || typeof slug !== 'string' || !locale || !slug) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Query params locale and slug are required.' },
      }
    }

    const targetPath = resolveSafeContentPath(locale, slug)

    let raw: string
    try {
      raw = await readFile(targetPath, 'utf8')
    } catch {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: { code: 'ARTICLE_NOT_FOUND', message: `No article at content/${locale}/blog/${slug}.md.` },
      }
    }

    let parsed: { metadata: Record<string, unknown>; body: string }
    try {
      parsed = parseArticleFile(raw)
    } catch (err) {
      setResponseStatus(event, 422)
      return {
        success: false,
        error: {
          code: 'FRONTMATTER_PARSE_ERROR',
          message: err instanceof Error ? err.message : 'Unparseable frontmatter.',
        },
      }
    }

    return { success: true, data: { metadata: parsed.metadata, rawContent: parsed.body } }
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
