import { Request, Response } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { config } from '../../config'

const GLOBAL_WINDOW_MS = 60_000
const LOGIN_WINDOW_MS = 15 * 60_000
const LOGIN_IP_LIMIT = 20

type RateLimiterOverrides = { max?: number; windowMs?: number }

export function createGlobalRateLimiter(overrides: RateLimiterOverrides = {}) {
  return rateLimit({
    windowMs: overrides.windowMs ?? GLOBAL_WINDOW_MS,
    limit: overrides.max ?? config.rateLimit.globalMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: (req) => config.skipPaths.some((p) => req.path.startsWith(p)),
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ error: 'Demasiadas solicitudes. Intente nuevamente más tarde.' })
    },
  })
}

export function createLoginRateLimiter(overrides: RateLimiterOverrides = {}) {
  return rateLimit({
    windowMs: overrides.windowMs ?? LOGIN_WINDOW_MS,
    limit: overrides.max ?? config.rateLimit.loginMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) => {
      const identifier = String(req.body?.login || req.body?.email || '').trim().toLowerCase()
      return `${ipKeyGenerator(req.ip ?? '')}|${identifier}`
    },
    skipSuccessfulRequests: true,
    validate: { keyGeneratorIpFallback: false },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ error: 'Demasiados intentos de inicio de sesión. Intente nuevamente más tarde.' })
    },
  })
}

export function createLoginIpRateLimiter(overrides: RateLimiterOverrides = {}) {
  return rateLimit({
    windowMs: overrides.windowMs ?? LOGIN_WINDOW_MS,
    limit: overrides.max ?? LOGIN_IP_LIMIT,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ error: 'Demasiados intentos de inicio de sesión. Intente nuevamente más tarde.' })
    },
  })
}
