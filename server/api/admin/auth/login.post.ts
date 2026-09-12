import { createSessionToken, verifyPassword, ADMIN_SESSION_COOKIE } from '../../../utils/admin/authGuard'

const WEEK_SECONDS = 60 * 60 * 24 * 7

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ password?: unknown }>(event)
    if (!verifyPassword(body?.password)) {
      setResponseStatus(event, 401)
      return {
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'كلمة المرور غير صحيحة' },
      }
    }

    setCookie(event, ADMIN_SESSION_COOKIE, createSessionToken(String(body?.password)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: WEEK_SECONDS,
      path: '/',
    })
    return { success: true, message: 'Authenticated' }
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
