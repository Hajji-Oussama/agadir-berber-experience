import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import {
  contentDirFor,
  normalizeContentType,
  resolveSafeContentPath,
  findProjectRoot,
} from '../../utils/admin/pathGuard'
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

const BLOG_KEY_ORDER = ['title', 'description', 'image', 'author', 'date', 'sitemap']
const EXPERIENCE_KEY_ORDER = [
  'title',
  'description',
  'image',
  'price',
  'duration',
  'category',
  'vehicle',
  'seats',
  'gallery',
  'sitemap',
]

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
      type?: unknown
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

    // `type` defaults to `blog` (backward compatible).
    const contentType = normalizeContentType(body?.type)

    const result = validateArticlePayload(
      locale,
      slug,
      metadata,
      typeof rawContent === 'string' ? rawContent : '',
      contentType
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

    const targetPath = resolveSafeContentPath(locale, slug, contentType)
    const targetRel = `content/${locale}/${contentDirFor(contentType)}/${slug}.md`

    const canonicalOrder =
      contentType === 'experience' ? EXPERIENCE_KEY_ORDER : BLOG_KEY_ORDER
    const ordered: Record<string, unknown> = {}
    const source = (metadata ?? {}) as Record<string, unknown>
    for (const key of canonicalOrder) {
      if (source[key] !== undefined) ordered[key] = source[key]
    }
    for (const [key, value] of Object.entries(source)) {
      if (!(key in ordered)) ordered[key] = value
    }
    await atomicWriteFile(targetPath, serializeArticleFile(ordered, rawContent as string))

    isPublishing = true
    try {
      // Step A: stage the markdown file (surgical — this exact file only).
      try {
        await runGit(['add', '--', targetRel])
      } catch (err) {
        const failure = err as GitFailure
        failure.code = 'GIT_ADD_FAILED'
        throw failure
      }

      // Step A2: atomic media sync — uploads land in public/images/ via the
      // upload endpoint but were previously never staged, leaving orphaned
      // untracked assets behind. Stage existing media dirs (existence-checked
      // so a missing dir never fails the pathspec). No-op when clean.
      const projectRoot = findProjectRoot()
      const mediaDirs = ['public/images/experiences', 'public/images/blog'].filter((rel) =>
        existsSync(path.join(projectRoot, rel))
      )
      if (mediaDirs.length > 0) {
        try {
          await runGit(['add', '--', ...mediaDirs])
        } catch (err) {
          const failure = err as GitFailure
          failure.code = 'GIT_MEDIA_ADD_FAILED'
          throw failure
        }
      }

      // Step A3: verify which public/ assets are staged for this commit
      // (observability — never blocks the publish on inspection failure).
      let mediaSynced: string[] = []
      try {
        const statusOut = await runGit(['status', '--porcelain', '--', 'public/images'])
        mediaSynced = statusOut
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => {
            const entry = line.slice(2).trim()
            const arrow = entry.lastIndexOf(' -> ')
            return arrow >= 0 ? entry.slice(arrow + 4) : entry
          })
      } catch {
        mediaSynced = []
      }

      // Step B: atomic commit of content + media (tolerate clean tree —
      // file may be byte-identical and no media pending).
      const commitMsg = commitNote
        ? `content(cms): publish ${slug} [${locale}/${contentType}] with synced media assets - ${commitNote}`
        : `content(cms): publish ${slug} [${locale}/${contentType}] with synced media assets`
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
          mediaSynced,
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
