import { execFile } from 'node:child_process'
import { resolveSafeContentPath, findProjectRoot } from '../../utils/admin/pathGuard'
import { validateArticlePayload } from '../../utils/admin/validator'
import { serializeArticleFile, atomicWriteFile } from '../../utils/admin/fileOps'
import { requireAdminSession } from '../../utils/admin/authGuard'

const GIT_TIMEOUT_MS = 30000

// In-memory mutex: Nitro may serve concurrent admin requests from one
// process; overlapping git runs collide on .git/index.lock.
let isPublishing = false

interface GitFailure extends Error {
  code: string
  stderr: string
}

function runGit(args: string[], timeoutMs = GIT_TIMEOUT_MS): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      'git',
      args,
      { cwd: findProjectRoot(), timeout: timeoutMs, maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          const failure = new Error(
            `git ${args[0] ?? ''} failed: ${(stderr || err.message).trim()}`
          ) as GitFailure
          failure.code = 'GIT_COMMAND_FAILED'
          failure.stderr = stderr ?? ''
          reject(failure)
          return
        }
        resolve(stdout.trim())
      }
    )
  })
}

const CANONICAL_KEY_ORDER = ['title', 'description', 'image', 'author', 'date', 'sitemap']

function isNothingToCommit(message: string): boolean {
  return /nothing to commit|no changes added to commit|working tree clean/i.test(message)
}

export default defineEventHandler(async (event) => {
  if (isPublishing) {
    setResponseStatus(event, 409)
    return {
      success: false,
      error: {
        code: 'PUBLISH_LOCKED',
        message: 'A publishing process is already in progress.',
      },
    }
  }

  try {
    requireAdminSession(event)
    const body = await readBody<{
      locale?: unknown
      slug?: unknown
      metadata?: unknown
      rawContent?: unknown
      commitNote?: unknown
    }>(event)

    const locale = body?.locale
    const slug = body?.slug
    const metadata = body?.metadata as Record<string, unknown> | undefined
    const rawContent = body?.rawContent
    const commitNote = typeof body?.commitNote === 'string' ? body.commitNote.trim() : ''

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
    const targetRel = `content/${locale}/blog/${slug}.md`

    const ordered: Record<string, unknown> = {}
    const source = (metadata ?? {}) as Record<string, unknown>
    for (const key of CANONICAL_KEY_ORDER) {
      if (source[key] !== undefined) ordered[key] = source[key]
    }
    for (const [key, value] of Object.entries(source)) {
      if (!(key in ordered)) ordered[key] = value
    }
    await atomicWriteFile(targetPath, serializeArticleFile(ordered, rawContent as string))

    isPublishing = true
    try {
      // Step A: surgical staging — this exact file only, never `git add .`.
      try {
        await runGit(['add', targetRel])
      } catch (err) {
        const failure = err as GitFailure
        failure.code = 'GIT_ADD_FAILED'
        throw failure
      }

      // Step B: commit (tolerate clean tree — file may be byte-identical).
      const commitMsg = commitNote
        ? `feat(content): ${slug} [${locale}] - ${commitNote}`
        : `feat(content): publish ${slug} [${locale}]`
      try {
        await runGit(['commit', '-m', commitMsg])
      } catch (err) {
        const failure = err as GitFailure
        if (!isNothingToCommit(`${failure.message} ${failure.stderr ?? ''}`)) {
          failure.code = 'GIT_COMMIT_FAILED'
          throw failure
        }
      }

      // Step C: push with strict timeout.
      try {
        await runGit(['push', 'origin', 'main'], GIT_TIMEOUT_MS)
      } catch (err) {
        const failure = err as GitFailure
        failure.code = 'GIT_PUSH_FAILED'
        throw failure
      }

      // Step D: capture hash.
      const commitHash = await runGit(['rev-parse', '--short', 'HEAD'])

      return {
        success: true,
        data: {
          commitHash,
          publishedAt: new Date().toISOString(),
          targetFile: targetRel,
          warnings: result.warnings,
        },
      }
    } finally {
      isPublishing = false
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
