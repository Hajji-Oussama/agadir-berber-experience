import { getCookie } from 'h3'
import { verifySessionToken, ADMIN_SESSION_COOKIE } from '../../../utils/admin/authGuard'

export default defineEventHandler((event) => {
  const token = getCookie(event, ADMIN_SESSION_COOKIE)
  return { authenticated: verifySessionToken(token) }
})
