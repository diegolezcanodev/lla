import type { cookies as cookiesFn } from 'next/headers'

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

type CookieStore = Awaited<ReturnType<typeof cookiesFn>>

export function readPageSize(cookies: CookieStore, key: string, fallback = DEFAULT_PAGE_SIZE): number {
  const fallbackValue = PAGE_SIZE_OPTIONS.includes(fallback) ? fallback : DEFAULT_PAGE_SIZE
  const raw = cookies.get(key)?.value
  if (!raw) return fallbackValue
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return fallbackValue
  const truncated = Math.trunc(n)
  if (!PAGE_SIZE_OPTIONS.includes(truncated)) return fallbackValue
  return truncated
}

export function writePageSizeCookie(key: string, size: number): void {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 365 * 10
  document.cookie = `${key}=${size}; path=/; max-age=${maxAge}; samesite=lax`
}
