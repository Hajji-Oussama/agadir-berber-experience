import { mkdir, writeFile, access } from 'node:fs/promises'
import type { H3Event } from 'h3'
import {
  mediaRoot,
  mediaUrlPrefixFor,
  normalizeMediaDestination,
  resolveSafeMediaPath,
} from '../../utils/admin/pathGuard'
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  ALLOWED_UPLOAD_MIMES,
  MAX_UPLOAD_BYTES,
  extensionOf,
  sanitizeImageBasename,
} from '../../utils/admin/mediaName'
import { requireAdminSession } from '../../utils/admin/authGuard'

function errorResponse(event: H3Event, statusCode: number, code: string, message: string) {
  setResponseStatus(event, statusCode)
  return { success: false, error: { code, message } }
}

export default defineEventHandler(async (event) => {
  try {
    requireAdminSession(event)

    const form = await readMultipartFormData(event)
    if (!form || form.length === 0) {
      return errorResponse(event, 400, 'MISSING_FILE', 'No multipart file payload received.')
    }

    // `destination` may arrive as a text field inside the multipart body
    // (preferred) or as a query param; defaults to `experiences`.
    const fieldValue = (name: string): string | undefined => {
      const part = form.find((p) => p.name === name && p.data != null && !p.filename)
      if (!part) return undefined
      return Buffer.isBuffer(part.data) ? part.data.toString('utf8') : String(part.data)
    }

    const destination = normalizeMediaDestination(
      fieldValue('destination') ?? getQuery(event)?.destination
    )

    const filePart = form.find((p) => p.name === 'file' && p.data != null && p.filename)
    if (!filePart || !filePart.data || (filePart.data as Buffer).length === 0) {
      return errorResponse(event, 400, 'MISSING_FILE', 'Multipart field "file" is required.')
    }

    const bytes = Buffer.isBuffer(filePart.data)
      ? filePart.data
      : Buffer.from(filePart.data as Uint8Array)
    if (bytes.length > MAX_UPLOAD_BYTES) {
      return errorResponse(
        event,
        413,
        'FILE_TOO_LARGE',
        `Image exceeds the ${MAX_UPLOAD_BYTES / (1024 * 1024)} MiB upload limit.`
      )
    }

    const mime = (filePart.type ?? '').toLowerCase().split(';')[0].trim()
    if (mime !== '' && !ALLOWED_UPLOAD_MIMES.includes(mime)) {
      return errorResponse(
        event,
        415,
        'UNSUPPORTED_TYPE',
        'Only image uploads are accepted (webp, jpg, png, gif, avif).'
      )
    }

    const originalName = filePart.filename ?? 'image'
    if (!ALLOWED_UPLOAD_EXTENSIONS.includes(extensionOf(originalName))) {
      return errorResponse(
        event,
        415,
        'UNSUPPORTED_TYPE',
        'File extension must be one of: webp, jpg, jpeg, png, gif, avif.'
      )
    }

    // Suggested name wins when provided (client-side SEO name field);
    // otherwise derive from the original upload filename.
    const suggested = fieldValue('filename') ?? fieldValue('name') ?? ''
    const base = sanitizeImageBasename(suggested.trim() !== '' ? suggested : originalName)
    // Forced `.webp` per project convention (bytes stored as-is; no
    // transcoding dependency installed — prefer real .webp sources).
    let filename = `${base}.webp`

    // Collision-safe: horse-riding.webp -> horse-riding-2.webp, -3, ...
    const dir = mediaRoot(destination)
    await mkdir(dir, { recursive: true })
    let candidate = filename
    let counter = 2
    for (;;) {
      // Throws through resolveSafeMediaPath on illegal input (400/403).
      resolveSafeMediaPath(candidate, destination)
      try {
        await access(resolveSafeMediaPath(candidate, destination))
        candidate = `${base}-${counter}.webp`
        counter += 1
        if (counter > 1000) {
          return errorResponse(event, 409, 'NAME_EXHAUSTED', 'Could not find a free filename.')
        }
      } catch {
        filename = candidate
        break
      }
    }

    await writeFile(resolveSafeMediaPath(filename, destination), bytes)

    const url = `${mediaUrlPrefixFor(destination)}${filename}`
    return { success: true, url, filename, destination }
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
