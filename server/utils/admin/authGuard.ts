import { createHmac, timingSafeEqual } from 'node:crypto'
import { getCookie } from 'h3'
import type { H3Event } from 'h3'

export const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_SALT = 'agadir-berbere-studio-session-v1'

function studioSecret(): string {
  const configured = process.env.STUDIO_PASSWORD
  return configured && configured.length > 0 ? configured : 'berbere2026'
}

/**
 * Deterministic HMAC session token bound to the current password.
 * Rotating STUDIO_PASSWORD invalidates every previously issued cookie.
 */
export function createSessionToken(password: string): string {
  return createHmac('sha256', password).update(SESSION_SALT).digest('hex')
}

export function verifySessionToken(token: unknown): boolean {
  if (typeof token !== 'string' || token === '') return false
  const expected = Buffer.from(createSessionToken(studioSecret()), 'utf8')
  const provided = Buffer.from(token, 'utf8')
  if (provided.length !== expected.length) return false
  return timingSafeEqual(provided, expected)
}

export function verifyPassword(candidate: unknown): boolean {
  if (typeof candidate !== 'string' || candidate === '') return false
  const expected = Buffer.from(createSessionToken(studioSecret()), 'utf8')
  const provided = Buffer.from(createSessionToken(candidate), 'utf8')
  return timingSafeEqual(provided, expected)
}

export interface AuthError extends Error {
  statusCode: number
  code: string
}

/**
 * Throw a 401 envelope-compatible error when the admin session is
 * missing or invalid. Call first in every mutation endpoint.
 */
export function requireAdminSession(event: H3Event): void {
  const token = getCookie(event, ADMIN_SESSION_COOKIE)
  if (!verifySessionToken(token)) {
    const err = new Error('Unauthorized: valid admin session required.') as AuthError
    err.statusCode = 401
    err.code = 'UNAUTHORIZED'
    throw err
  }
}
