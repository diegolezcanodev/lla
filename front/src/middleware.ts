import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = process.env.COOKIE_NAME ?? 'lla_session'
const LOGIN_PAGE = '/'

function decodeToken(token: string): { roles?: string[]; exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

function extractJwtFromSignedCookie(raw: string | undefined): string | null {
  if (!raw) return null
  const value = raw.startsWith('s:') ? raw.slice(2) : raw
  const parts = value.split('.')
  if (parts.length < 3) return null
  return parts.slice(0, -1).join('.')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const rawCookie = request.cookies.get(COOKIE_NAME)?.value
  const jwt = rawCookie ? extractJwtFromSignedCookie(rawCookie) : null
  const payload = jwt ? decodeToken(jwt) : null

  if (!payload || !payload.roles) {
    if (pathname === LOGIN_PAGE) {
      const response = NextResponse.next()
      if (rawCookie) response.cookies.delete(COOKIE_NAME)
      return response
    }
    const response = NextResponse.redirect(new URL(LOGIN_PAGE, request.url))
    if (rawCookie) response.cookies.delete(COOKIE_NAME)
    return response
  }

  if (pathname === LOGIN_PAGE) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/equipo/:path*',
    '/barrios/:path*',
    '/empresas/:path*',
    '/stakeholders/:path*',
    '/escuelas/:path*',
    '/reclamos/:path*',
    '/oposicion/:path*',
    '/tareas/:path*',
    '/usuarios/:path*',
  ],
}
