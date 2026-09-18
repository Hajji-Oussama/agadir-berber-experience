import { mkdir, rename, access } from 'node:fs/promises'
import path from 'node:path'
import {
  contentDirFor,
  normalizeContentType,
  resolveSafeContentPath,
  findProjectRoot,
} from '../../utils/admin/pathGuard'
import { requireAdminSession } from '../../utils/admin/authGuard'

export default defineEventHandler(async (event) => {
  try {
    requireAdminSession(event)

    const body = await readBody<{ locale?: unknown; slug?: unknown; type?: unknown }>(event)
    const locale = body?.locale
    const slug = body?.slug
    if (typeof locale !== 'string' || typeof slug !== 'string') {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Body fields locale and slug are required.' },
      }
    }

    const contentType = normalizeContentType(body?.type)

    // The 6 core adventure tours are a protected catalog: experiences can be
    // edited but never deleted through the Studio (prevents accidental loss
    // of bookable services). Blog articles remain deletable (trash + restore).
    if (contentType === 'experience') {
      setResponseStatus(event, 403)
      return {
        success: false,
        error: {
          code: 'EXPERIENCE_DELETE_FORBIDDEN',
          message: 'Experiences are a protected catalog and cannot be deleted. Edit them instead.',
        },
      }
    }

    const sourcePath = resolveSafeContentPath(locale, slug, contentType)

    try {
      await access(sourcePath)
    } catch {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: {
          code: 'ARTICLE_NOT_FOUND',
          message: `No article at content/${locale}/${contentDirFor(contentType)}/${slug}.md.`,
        },
      }
    }

    // Safe trash relocation: timestamped copy under .backups/trash —
    // never a permanent wipe without a trace.
    const trashDir = path.join(findProjectRoot(), '.backups', 'trash', locale)
    await mkdir(trashDir, { recursive: true })
    const trashPath = path.join(trashDir, `${slug}_${Date.now()}.md`)
    await rename(sourcePath, trashPath)

    return { success: true, message: 'Article safely moved to trash' }
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
