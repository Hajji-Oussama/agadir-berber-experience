import { readdir, stat, readFile } from 'node:fs/promises'
import path from 'node:path'
import { mediaRoot, contentRoot } from '../../utils/admin/pathGuard'

const LOCAL_IMAGE_RE = /\.(webp|jpe?g|png)$/i
const CLOUDINARY_RE = /https:\/\/res\.cloudinary\.com\/[^\s"'\)\]]+/g
const MAX_CLOUDINARY_ITEMS = 300

async function collectMarkdownFiles(dir: string, out: string[]): Promise<void> {
  let entries: string[] = []
  try {
    entries = await readdir(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    const full = path.join(dir, entry)
    let entryStat: { isDirectory(): boolean; isFile(): boolean }
    try {
      entryStat = await stat(full)
    } catch {
      continue
    }
    if (entryStat.isDirectory()) {
      await collectMarkdownFiles(full, out)
    } else if (entryStat.isFile() && entry.endsWith('.md')) {
      out.push(full)
    }
  }
}

export default defineEventHandler(async (event) => {
  try {
    const local: { filename: string; url: string; isLocal: boolean }[] = []
    try {
      const files = await readdir(mediaRoot())
      for (const file of files.filter((f) => LOCAL_IMAGE_RE.test(f)).sort()) {
        local.push({ filename: file, url: `/images/blog/${file}`, isLocal: true })
      }
    } catch {
      // Media directory may not exist yet; local list stays empty.
    }

    const cloudinarySeen = new Set<string>()
    const cloudinary: { filename: string; url: string; isLocal: boolean }[] = []
    const mdFiles: string[] = []
    await collectMarkdownFiles(contentRoot(), mdFiles)
    for (const file of mdFiles) {
      let raw = ''
      try {
        raw = await readFile(file, 'utf8')
      } catch {
        continue
      }
      for (const match of raw.match(CLOUDINARY_RE) ?? []) {
        const url = match.replace(/[.,;:!?]+$/, '')
        if (cloudinarySeen.has(url) || cloudinary.length >= MAX_CLOUDINARY_ITEMS) continue
        cloudinarySeen.add(url)
        const lastSegment = url.split('?')[0].split('/').pop() ?? url
        cloudinary.push({ filename: lastSegment, url, isLocal: false })
      }
      if (cloudinary.length >= MAX_CLOUDINARY_ITEMS) break
    }
    cloudinary.sort((a, b) => a.filename.localeCompare(b.filename))

    return { success: true, data: [...local, ...cloudinary] }
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
