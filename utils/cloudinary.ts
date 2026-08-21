// Helper to append Cloudinary transformation params to our image URLs.
// Handles both bare (f_auto,q_auto) and already-transformed (f_auto,q_auto,w_1200,c_limit)
// URLs: it rebuilds the transformation segment, dropping any conflicting
// width/height/crop/gravity params before appending the requested ones.
const UPLOAD_BASE = 'image/upload/'

export function cloudinaryImage(url: string | undefined | null, params: string): string {
  if (!url || !url.includes(UPLOAD_BASE)) return url || ''
  const match = url.match(/(image\/upload\/)([^/]*)(\/v)/)
  if (!match) return url
  const existing = match[2].split(',').filter((p) => p && !p.startsWith('w_') && !p.startsWith('h_') && !p.startsWith('c_') && !p.startsWith('g_') && p !== 'f_auto' && p !== 'q_auto')
  const merged = ['f_auto', 'q_auto', ...existing, ...params.split(',')]
  return url.replace(match[0], `${match[1]}${merged.join(',')}${match[3]}`)
}
