function parseTrustProxy(raw?: string): false | number | string[] {
  const value = raw?.trim()
  if (!value || value === '0' || value === 'false') return false
  if (value === 'true') return 1
  if (/^\d+$/.test(value)) return parseInt(value, 10)
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

const jwtSecret = process.env.JWT_SECRET || (isProd ? '' : 'dev-secret-lla-do-not-use-in-prod')
const cookieSecret = process.env.COOKIE_SECRET || (isProd ? '' : 'dev-cookie-secret-lla-do-not-use-in-prod')

if (isProd && (!jwtSecret || !cookieSecret)) {
  throw new Error('[config] En producción JWT_SECRET y COOKIE_SECRET son obligatorios')
}

export const config = {
  port: parseInt(process.env.PORT || '3500', 10),
  nodeEnv,
  database: {
    url: process.env.DATABASE_URL || 'postgresql://lla:lla@localhost:5438/lla',
  },
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  },
  cookie: {
    name: process.env.COOKIE_NAME || 'lla_session',
    secret: cookieSecret,
    secure: isProd,
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 12 * 60 * 60 * 1000,
  },
  logs: {
    console: process.env.LOG_CONSOLE === 'true',
    dbUrl: process.env.LOGS_DATABASE_URL || '',
    flushIntervalMs: parseInt(process.env.LOGS_FLUSH_INTERVAL || '5000', 10),
    batchSize: parseInt(process.env.LOGS_BATCH_SIZE || '50', 10),
    level: process.env.LOG_LEVEL || 'info',
    requests: {
      enabled: process.env.LOG_REQUESTS !== 'false',
      slowMs: parseInt(process.env.LOG_REQUESTS_SLOW_MS || '0', 10),
      logBody: process.env.LOG_REQUESTS_BODY !== 'false',
    },
    app: { enabled: process.env.LOG_APP !== 'false' },
    prismaQueries: {
      enabled: process.env.LOG_PRISMA_QUERIES === 'true',
      slowQueryMs: parseInt(process.env.LOG_SLOW_QUERY_MS || '0', 10),
      logParams: process.env.LOG_PRISMA_PARAMS === 'true',
    },
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3501').split(',').map(s => s.trim()).filter(Boolean),
  },
  rateLimit: {
    trustProxy: parseTrustProxy(process.env.RATE_LIMIT_TRUST_PROXY),
    globalMax: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '200', 10),
    loginMax: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '10', 10),
  },
  skipPaths: (process.env.LOG_REQUESTS_SKIP_PATHS || '/api/health').split(',').map(s => s.trim()).filter(Boolean),
}
