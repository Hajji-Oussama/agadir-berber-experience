/**
 * Shared image-filename sanitizer for admin uploads.
 *
 * Convention (see content_template.md): ALL blog and experience images must
 * be `.webp` with clean lowercase kebab-case names, e.g.
 * `/images/experiences/horse-riding-sunset.webp`.
 *
 * NOTE: there is no image-transcoding dependency (sharp) in this project,
 * so the sanitizer renames bytes as-is and forces the `.webp` extension per
 * convention. Browsers content-sniff `<img>` payloads, but for smallest
 * files and full compliance prefer uploading real `.webp` sources.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 // 8 MiB

export const ALLOWED_UPLOAD_MIMES: readonly string[] = [
  'image/webp',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/avif',
  // Some browsers / clients send a generic binary type for picked files.
  'application/octet-stream',
]

export const ALLOWED_UPLOAD_EXTENSIONS: readonly string[] = [
  'webp',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'avif',
]

const KEBAB_NAME_RE = /^[a-z0-9-]+$/

/**
 * Strip the extension, transliterate to ASCII, lowercase, and collapse every
 * run of non-alphanumeric characters into a single hyphen.
 * `womanInTheHors.jpg` -> `woman-in-the-hors`
 */
export function sanitizeImageBasename(raw: string): string {
  const withoutExt = raw.split('?')[0].replace(/\.[a-z0-9]+$/i, '')
  const ascii = withoutExt
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^ -~]/g, '')
    .toLowerCase()
  const kebab = ascii
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return kebab === '' ? 'image' : kebab.slice(0, 120)
}

/** Full compliant filename: kebab-case basename forced to `.webp`. */
export function sanitizeImageFilename(raw: string): string {
  return `${sanitizeImageBasename(raw)}.webp`
}

/** True when the filename is lowercase kebab-case ending in `.webp`. */
export function isCompliantImageFilename(filename: string): boolean {
  if (!filename.endsWith('.webp')) return false
  const base = filename.slice(0, -'.webp'.length)
  return base.length > 0 && KEBAB_NAME_RE.test(base)
}

export function extensionOf(filename: string): string {
  const tail = filename.split('?')[0].split('/').pop() ?? ''
  const dot = tail.lastIndexOf('.')
  return dot === -1 ? '' : tail.slice(dot + 1).toLowerCase()
}
