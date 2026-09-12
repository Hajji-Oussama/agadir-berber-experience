import path from 'node:path'
import { existsSync } from 'node:fs'

export type AdminLocale = 'ar' | 'en' | 'fr'

export const ALLOWED_LOCALES: readonly AdminLocale[] = ['ar', 'en', 'fr']

const SLUG_PATTERN = /^[a-z0-9-]+$/
const MAX_SLUG_LENGTH = 120
const MAX_FILENAME_LENGTH = 180
const MEDIA_FILENAME_PATTERN = /^[\p{L}\p{N}._\-() ]+$/u

export interface GuardError extends Error {
  statusCode: number
  code: string
}

function guardError(statusCode: number, code: string, message: string): GuardError {
  const err = new Error(message) as GuardError
  err.statusCode = statusCode
  err.code = code
  return err
}

/**
 * Resolve the project root at runtime. Works in dev (cwd = root) and in
 * production when the Nitro server is launched from the project root.
 * Falls back to process.cwd() when no marker is found.
 */
export function findProjectRoot(): string {
  let dir = path.resolve(process.cwd())
  for (let depth = 0; depth < 5; depth++) {
    try {
      if (
        existsSync(path.join(dir, 'content')) &&
        existsSync(path.join(dir, 'nuxt.config.ts'))
      ) {
        return dir
      }
    } catch {
      // ignore and keep walking up
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return path.resolve(process.cwd())
}

export function contentRoot(): string {
  return path.join(findProjectRoot(), 'content')
}

export function mediaRoot(): string {
  return path.join(findProjectRoot(), 'public', 'images', 'blog')
}

function isWithin(parentDir: string, childPath: string): boolean {
  const normalizedParent = path.resolve(parentDir)
  const normalizedChild = path.resolve(childPath)
  return (
    normalizedChild === normalizedParent ||
    normalizedChild.startsWith(normalizedParent + path.sep)
  )
}

function assertValidLocale(locale: unknown): asserts locale is AdminLocale {
  if (typeof locale !== 'string' || !(ALLOWED_LOCALES as readonly string[]).includes(locale)) {
    throw guardError(400, 'INVALID_LOCALE', 'Locale must be strictly one of: ar, en, fr.')
  }
}

function assertValidSlug(slug: unknown): asserts slug is string {
  if (typeof slug !== 'string' || slug.length === 0 || slug.length > MAX_SLUG_LENGTH) {
    throw guardError(400, 'INVALID_SLUG', 'Slug must be a non-empty string up to 120 characters.')
  }
  if (!SLUG_PATTERN.test(slug)) {
    throw guardError(
      400,
      'INVALID_SLUG',
      'Slug must be lowercase alphanumeric with hyphens only (^[a-z0-9-]+$).'
    )
  }
}

/**
 * Resolve `<rootDir>/content/<locale>/blog/<slug>.md` with strict
 * traversal protection. Throws 400 on invalid input, 403 on traversal.
 */
export function resolveSafeContentPath(locale: string, slug: string): string {
  assertValidLocale(locale)
  assertValidSlug(slug)
  const safeContentRoot = contentRoot()
  const resolvedPath = path.resolve(safeContentRoot, locale, 'blog', `${slug}.md`)
  if (!isWithin(safeContentRoot, resolvedPath)) {
    throw guardError(403, 'PATH_TRAVERSAL', 'Resolved content path escapes the allowed content root.')
  }
  return resolvedPath
}

/**
 * Resolve a file inside `<rootDir>/public/images/blog/`. Called without a
 * filename returns the media root directory itself (used for listing).
 */
export function resolveSafeMediaPath(filename?: string): string {
  const safeMediaRoot = mediaRoot()
  if (filename == null || filename === '') return safeMediaRoot
  if (typeof filename !== 'string' || filename.length > MAX_FILENAME_LENGTH) {
    throw guardError(400, 'INVALID_FILENAME', 'Media filename is invalid.')
  }
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    throw guardError(400, 'INVALID_FILENAME', 'Media filename must not contain path separators.')
  }
  if (path.basename(filename) !== filename || !MEDIA_FILENAME_PATTERN.test(filename)) {
    throw guardError(400, 'INVALID_FILENAME', 'Media filename contains forbidden characters.')
  }
  const resolvedPath = path.resolve(safeMediaRoot, filename)
  if (!isWithin(safeMediaRoot, resolvedPath)) {
    throw guardError(403, 'PATH_TRAVERSAL', 'Resolved media path escapes the allowed media root.')
  }
  return resolvedPath
}
