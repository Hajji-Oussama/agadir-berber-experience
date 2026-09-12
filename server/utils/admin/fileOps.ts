import { mkdir, access, copyFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { findProjectRoot } from './pathGuard'

export interface ParsedArticle {
  metadata: Record<string, unknown>
  body: string
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

function parseScalar(raw: string): string {
  const text = raw.trim()
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    // Single-pass unescape so `\\` collapses before `\"` is interpreted.
    return text.slice(1, -1).replace(/\\(\\|"|n|r|t)/g, (_m, ch: string) => {
      if (ch === 'n') return '\n'
      if (ch === 'r') return '\r'
      if (ch === 't') return '\t'
      return ch
    })
  }
  if (text.length >= 2 && text.startsWith("'") && text.endsWith("'")) {
    return text.slice(1, -1).replace(/''/g, "'")
  }
  return text
}

function isMappingKey(line: string): RegExpMatchArray | null {
  return line.match(/^([A-Za-z0-9_.\-]+):\s*(.*)$/)
}

/**
 * Minimal YAML-subset parser for article frontmatter: flat string scalars,
 * nested mappings (any depth via indentation) and scalar arrays. All values
 * stay strings (no bool/number coercion) for lossless round-trips. Throws on
 * constructs it cannot represent so saves never silently drop data.
 */
export function parseYamlMapping(src: string): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  const lines = src.split('\n')
  // Stack of open containers with their indent level.
  const stack: { indent: number; container: Record<string, unknown> | unknown[] }[] = [
    { indent: -1, container: root },
  ]
  // Pending key awaiting a nested block (key line had an empty value).
  let pending: { indent: number; key: string; parent: Record<string, unknown> } | null = null

  const peekNextMeaningful = (from: number): { line: string; indent: number } | null => {
    for (let k = from; k < lines.length; k++) {
      const raw = lines[k].replace(/\r$/, '')
      if (raw.trim() === '' || raw.trim().startsWith('#')) continue
      return { line: raw, indent: raw.length - raw.trimStart().length }
    }
    return null
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx].replace(/\r$/, '')
    if (rawLine.trim() === '' || rawLine.trim().startsWith('#')) continue
    const indent = rawLine.length - rawLine.trimStart().length
    const line = rawLine.trim()

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop()
    const current = stack[stack.length - 1].container

    if (line.startsWith('- ')) {
      if (!Array.isArray(current)) {
        throw new Error(`FRONTMATTER_PARSE_ERROR: list item outside a list (line ${idx + 1}).`)
      }
      current.push(parseScalar(line.slice(2)))
      pending = null
      continue
    }

    const keyMatch = isMappingKey(line)
    if (!keyMatch) {
      throw new Error(`FRONTMATTER_PARSE_ERROR: unsupported line ${idx + 1}: ${line}.`)
    }
    if (Array.isArray(current)) {
      throw new Error(`FRONTMATTER_PARSE_ERROR: mapping key inside a list (line ${idx + 1}).`)
    }
    const key = keyMatch[1]
    const rest = keyMatch[2]
    if (rest !== '') {
      ;(current as Record<string, unknown>)[key] = parseScalar(rest)
      pending = null
      continue
    }
    // Empty value -> nested block follows.
    const next = peekNextMeaningful(idx + 1)
    if (!next || next.indent <= indent) {
      throw new Error(`FRONTMATTER_PARSE_ERROR: empty value without nested block (line ${idx + 1}).`)
    }
    const container: Record<string, unknown> | unknown[] = next.line.trim().startsWith('- ')
      ? []
      : {}
    ;(current as Record<string, unknown>)[key] = container
    stack.push({ indent, container })
    pending = null
  }

  if (pending) {
    throw new Error('FRONTMATTER_PARSE_ERROR: dangling nested key at end of block.')
  }
  return root
}

function quoteScalar(value: string): string {
  return (
    '"' +
    value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t') +
    '"'
  )
}

export function serializeYamlMapping(data: Record<string, unknown>, level = 0): string {
  const pad = '  '.repeat(level)
  const out: string[] = []
  for (const [key, value] of Object.entries(data)) {
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      out.push(`${pad}${key}:`)
      out.push(serializeYamlMapping(value as Record<string, unknown>, level + 1))
    } else if (Array.isArray(value)) {
      out.push(`${pad}${key}:`)
      for (const item of value) {
        out.push(`${pad}  - ${quoteScalar(String(item))}`)
      }
    } else {
      out.push(`${pad}${key}: ${quoteScalar(value == null ? '' : String(value))}`)
    }
  }
  return out.join('\n')
}

export function parseArticleFile(raw: string): ParsedArticle {
  const match = FRONTMATTER_RE.exec(raw)
  if (!match) return { metadata: {}, body: raw }
  return { metadata: parseYamlMapping(match[1]), body: raw.slice(match[0].length) }
}

export function serializeArticleFile(
  metadata: Record<string, unknown>,
  body: string
): string {
  const normalizedBody = body === '' || body.startsWith('\n') ? body : `\n${body}`
  return `---\n${serializeYamlMapping(metadata)}\n---${normalizedBody}`
}

/**
 * Resolve the backup location for a target file. Backups live under the
 * isolated `<rootDir>/.backups/` tree (mirroring the target's relative
 * path) so stray `.bak` files never sit inside `content/` where
 * `@nuxt/content` would warn about unsupported files.
 */
export function backupPathFor(targetPath: string): string {
  const root = findProjectRoot()
  const relative = path.relative(root, path.resolve(targetPath))
  const safeRelative =
    relative === '' || relative.startsWith('..') ? path.basename(targetPath) : relative
  return path.join(root, '.backups', `${safeRelative}.bak`)
}

/**
 * Atomic write: tmp file (same directory, same filesystem) -> optional .bak
 * backup under `.backups/` -> atomic rename. On failure restores from backup
 * when needed and cleans up .tmp.
 */
export async function atomicWriteFile(targetPath: string, content: string): Promise<void> {
  await mkdir(path.dirname(targetPath), { recursive: true })
  const tmpPath = `${targetPath}.tmp`
  const bakPath = backupPathFor(targetPath)
  let existed = false
  try {
    await access(targetPath)
    existed = true
  } catch {
    existed = false
  }
  await writeFile(tmpPath, content, 'utf8')
  try {
    if (existed) {
      await mkdir(path.dirname(bakPath), { recursive: true })
      await copyFile(targetPath, bakPath)
    }
    await rename(tmpPath, targetPath)
  } catch (err) {
    try {
      if (existed) await copyFile(bakPath, targetPath)
    } catch {
      // best-effort restore; original error below takes precedence
    }
    try {
      await unlink(tmpPath)
    } catch {
      // best-effort cleanup
    }
    throw err
  }
}
