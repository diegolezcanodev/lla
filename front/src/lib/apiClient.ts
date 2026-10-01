const BASE_URL = (process.env.API_URL ?? 'http://localhost:3500').replace(/\/+$/, '')
const REQUEST_TIMEOUT = 15_000

type CookieStore = {
  toString(): string
}

function getServerCookies(): Promise<{ store: CookieStore; header: string } | null> {
  return import('next/headers')
    .then(({ cookies }) => cookies())
    .then((store) => {
      const s = store as CookieStore
      return { store: s, header: s.toString() }
    })
    .catch(() => null)
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  const server = await getServerCookies()
  if (server?.header) headers['Cookie'] = server.header

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const res = await fetch(server ? `${BASE_URL}${path}` : path, {
      cache: 'no-store',
      credentials: 'include',
      signal: controller.signal,
      ...options,
      headers,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new ApiError(res.status, body.error ?? res.statusText, body.details, body.code)
    }
    if (res.status === 204) return undefined as T
    return res.json()
  } finally {
    clearTimeout(timeout)
  }
}

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  return request<T>(path, options)
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
