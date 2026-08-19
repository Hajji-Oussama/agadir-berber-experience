// Helper to append Cloudinary transformation params to our image URLs.
// Base URLs already carry f_auto,q_auto (e.g. /image/upload/f_auto,q_auto/v...),
// so we insert the extra params right after the base transformation.
const UPLOAD_BASE = 'image/upload/'
const AUTO = 'f_auto,q_auto'

export function cloudinaryImage(url: string | undefined | null, params: string): string {
  if (!url || !url.includes(UPLOAD_BASE)) return url || ''
  return url.replace(`${UPLOAD_BASE}${AUTO}/`, `${UPLOAD_BASE}${AUTO},${params}/`)
}
