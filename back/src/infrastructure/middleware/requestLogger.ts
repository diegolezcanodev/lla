import { Request, Response, NextFunction } from 'express'
import { getAppContext } from '../../shared-kernel/AppContext'
import { winstonLogger } from '../logger/logger'
import { config } from '../../config'

const skipPaths = config.skipPaths

const SENSITIVE_FIELDS = ['password', 'contrasena']

function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitive)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_FIELDS.includes(k) ? '[redacted]' : redactSensitive(v)
    }
    return out
  }
  return value
}

function redactResponse(raw: string): string | undefined {
  try {
    return JSON.stringify(redactSensitive(JSON.parse(raw)))
  } catch {
    return raw
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (!config.logs.requests.enabled) return next()
  if (skipPaths.some((p) => req.path.startsWith(p))) return next()

  const start = Date.now()
  const originalJson = res.json.bind(res)

  res.json = function (body: unknown) {
    res.locals.responseBody = typeof body === 'string' ? body : JSON.stringify(body)
    return originalJson(body)
  }

  res.on('finish', () => {
    const durationMs = Date.now() - start
    const isError = res.statusCode >= 400
    const slowMs = config.logs.requests.slowMs
    if (!isError && slowMs > 0 && durationMs < slowMs) return

    const context = getAppContext()
    const logBody = config.logs.requests.logBody

    const rawResponseBody = res.locals.responseBody as string | undefined
    const responseError =
      (res.locals.apiError as string | undefined) ??
      (() => {
        if (!rawResponseBody) return undefined
        try {
          return JSON.parse(rawResponseBody).error
        } catch {
          return undefined
        }
      })()

    winstonLogger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
      category: 'http',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      error: responseError,
      userId: context?.userId,
      roles: context?.roles?.join(',') || undefined,
      requestBody:
        logBody && req.body && Object.keys(req.body).length
          ? JSON.stringify(redactSensitive(req.body))
          : undefined,
      responseBody: logBody && rawResponseBody ? redactResponse(rawResponseBody) : undefined,
    })
  })
  next()
}
