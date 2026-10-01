# Blueprint de Arquitectura — KinesioCenter

> **Propósito:** Este documento es la memoria técnica y el plano de acción para replicar
> la arquitectura de KinesioCenter en un **proyecto nuevo** con la misma base: backend en
> Express + TypeScript + Prisma + PostgreSQL con arquitectura hexagonal/DDD simplificada,
> frontend en Next.js 14 (App Router) + React 18 + Tailwind, validación con Valibot,
> tests con Vitest (back) y Playwright (e2e front).
>
> Todo el código que figura acá es **código real del repo** (truncado cuando conviene),
> para usarlo como plantilla.

---

## Tabla de contenidos

1. [Stack y decisiones](#1-stack-y-decisiones)
2. [Estructura del repositorio (monorepo)](#2-estructura-del-repositorio)
3. [Backend — Arquitectura por capas](#3-backend--arquitectura-por-capas)
4. [Backend — Config centralizada](#4-backend--config-centralizada)
5. [Backend — Shared Kernel](#5-backend--shared-kernel)
6. [Backend — Infraestructura](#6-backend--infraestructura)
7. [Backend — Controllers](#7-backend--controllers)
8. [Backend — Application layer](#8-backend--application-layer)
9. [Backend — Domain layer](#9-backend--domain-layer)
10. [Backend — Repositorios](#10-backend--repositorios)
11. [Backend — Validación con Valibot](#11-backend--validación-con-valibot)
12. [Backend — Prisma / Base de datos](#12-backend--prisma--base-de-datos)
13. [Backend — Logging](#13-backend--logging)
14. [Backend — Convenciones y naming](#14-backend--convenciones-y-naming)
15. [Frontend — Estructura de la app](#15-frontend--estructura-de-la-app)
16. [Frontend — Autenticación y sesión](#16-frontend--autenticación-y-sesión)
17. [Frontend — AppShell, Sidebar y contexto](#17-frontend--appshell-sidebar-y-contexto)
18. [Frontend — Patrón Manager + List + useCrud](#18-frontend--patrón-manager--list--usecrud)
19. [Frontend — Server Actions y Services](#19-frontend--server-actions-y-services)
20. [Frontend — Tipos espejo](#20-frontend--tipos-espejo)
21. [Frontend — Componentes base](#21-frontend--componentes-base)
22. [Frontend — Sistema de diseño (estética base)](#22-frontend--sistema-de-diseño)
23. [Tests — Backend (Vitest)](#23-tests--backend-vitest)
24. [Tests — E2E (Playwright)](#24-tests--e2e-playwright)
25. [Comandos de desarrollo](#25-comandos-de-desarrollo)
26. [Checklist para el proyecto nuevo](#26-checklist-para-el-proyecto-nuevo)

---

## 1. Stack y decisiones

| Capa | Tecnología | Detalle |
|------|-----------|---------|
| Runtime | Node.js + TypeScript | ES2022, `commonjs`, strict |
| HTTP Back | Express 4 | Factories de app y routers |
| ORM | Prisma 5 | PostgreSQL; **2 esquemas** (principal + logs) |
| Validación | Valibot | `pipe()`, `safeParse`, `flatten` |
| Logging | Winston + DB diferida | Console + `AsyncBatchTransport` a DB de logs |
| Testing back | Vitest | Unit (JS puro) + Integration (Postgres real en `:5435`) |
| Testing e2e | Playwright | 3 browsers (chromium, firefox, webkit) |
| Package manager | pnpm | `workspace` implícito por carpetas (`front/`, `back/`) |

**Convención horaria global:** `America/Argentina/Buenos_Aires` (UTC-3 fijo, sin DST).
Toda la manipulación de fechas pasa por helpers de `Dates.ts` (nunca getters locales sobre
columnas `@db.Date`).

---

## 2. Estructura del repositorio

```
KinesioCenter/
  package.json            # raíz: SOLO husky (NO scripts de app)
  .gitignore
  back/
    package.json
    tsconfig.json
    vitest.config.ts               # unit
    vitest.integration.config.ts   # integration (Postgres real)
    docker-compose.test.yml        # Postgres 16 de test en :5435 (tmpfs)
    src/
      config/index.ts
      lib/validation.ts
      controllers/
        <Recurso>Controller.ts
        helpers.ts
      infrastructure/
        di/container.ts
        http/{app.ts, routes.ts, server.ts}
        logger/{logger.ts, AsyncBatchTransport.ts}
        middleware/{auth.ts, authMiddleware.ts, contextMiddleware.ts,
                    errorHandler.ts, rateLimiter.ts, requestLogger.ts}
        prisma/{client.ts, logs-client.ts, schema.prisma, logs/schema.prisma}
        repositories/<Entidad>Repository.ts
      modules/
        <dominio>/
          application/{I<Dominio>AppService.ts, <Dominio>AppService.ts, <Dominio>DTO.ts}
          domain/<Dominio>Entity.ts, <Dominio>Repository.ts
      shared-kernel/{ApiError.ts, AppContext.ts, Dates.ts, DomainEvent.ts,
                     Entity.ts, Errors.ts, Precio.ts, Pagination.ts}
    tests/
      helpers/{test-db.ts, test-config.ts, fixtures.ts, services.ts}
      integration/*.test.ts
      http/*.test.ts
      unit/...
  front/
    package.json
    playwright.config.ts
    next.config.mjs
    src/
      app/{layout.tsx, page.tsx, middleware.ts}
      app/(authenticated)/{layout.tsx, _components/, <modulo>/{page.tsx, loading.tsx, _components/}}
      app/_components/LoginPage.tsx
      actions/<recurso>.ts          # Server Actions
      services/<recurso>.ts         # clientes/read para catálogos y server fetch
      components/<ComponenteBase>.tsx
      context/AuthContext.tsx
      lib/{apiClient.ts, useCrud.ts, actionResult.ts, handleActionError.ts, validation.ts, Dates.ts, dateTime.ts, ...}
      types/<recurso>.ts            # espejo de DTOs del back
      styles/{globals.css, animations.css}
```

---

## 3. Backend — Arquitectura por capas

Las dependencias fluyen en **una sola dirección**:

```
Controllers → Application (services) → Domain (entities, interfaces) → Infrastructure (implementaciones)
```

Reglas que se cumplen en el repo:

- **Controllers** dependen solo de interfaces de application (`I*AppService`).
- **Application** depende solo de interfaces de domain (`I*Repository`).
- **Domain** NO importa Prisma, Express ni la infra (solo shared-kernel).
- **Infrastructure** implementa las interfaces de domain.

Ejemplo del flujo completo de un `GET /api/pagos/:id`:

```
PagoController.getById        (controllers/PagoController.ts)
  → IPagoAppService.getById   (modules/pagos/application/IPagoAppService.ts)
  → PagoAppService.getById    (modules/pagos/application/PagoAppService.ts)
  → IPagoRepository.findById  (modules/pagos/domain/IPagoRepository.ts)
  → PagoRepository.findById   (infrastructure/repositories/PagoRepository.ts)
  → toPagoResponseDTO         (modules/pagos/application/PagoDTO.ts)
  → res.status(200).json(...)
```

---

## 4. Backend — Config centralizada

`src/config/index.ts` — lectura de env vars, con defaults de dev y validación en prod.

```ts
const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

const jwtSecret = process.env.JWT_SECRET || (isProd ? '' : 'dev-secret-do-not-use-in-prod')
const cookieSecret = process.env.COOKIE_SECRET || (isProd ? '' : 'dev-cookie-secret')

if (isProd && (!jwtSecret || !cookieSecret)) {
  throw new Error('[config] En producción JWT_SECRET y COOKIE_SECRET son obligatorios')
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv,
  database: { url: process.env.DATABASE_URL || 'postgresql://localhost:5432/kinesiocenter' },
  jwt: { secret: jwtSecret, expiresIn: process.env.JWT_EXPIRES_IN || '12h' },
  cookie: {
    name: process.env.COOKIE_NAME || 'session',
    secret: cookieSecret,
    secure: isProd,
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 12 * 60 * 60 * 1000,
    refreshName: process.env.REFRESH_COOKIE_NAME || 'refresh_token',
  },
  security: {
    loginMaxAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS || '5', 10),
    loginLockMinutes: parseInt(process.env.LOGIN_LOCK_MINUTES || '15', 10),
    refreshTokenTtlMs: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '30', 10) * 24 * 60 * 60 * 1000,
  },
  logs: {
    dbUrl: process.env.LOGS_DATABASE_URL || '',
    flushIntervalMs: parseInt(process.env.LOGS_FLUSH_INTERVAL || '5000', 10),
    batchSize: parseInt(process.env.LOGS_BATCH_SIZE || '50', 10),
    level: process.env.LOG_LEVEL || 'info',
    requests: { enabled: process.env.LOG_REQUESTS !== 'false' },
    app: { enabled: process.env.LOG_APP !== 'false' },
    prismaQueries: { enabled: process.env.LOG_PRISMA_QUERIES === 'true' },
  },
  cors: { origins: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean) },
  rateLimit: {
    globalMax: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '100', 10),
    loginMax: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '5', 10),
  },
  skipPaths: (process.env.LOG_REQUESTS_SKIP_PATHS || '/api/health').split(',').map(s => s.trim()).filter(Boolean),
}
```

---

## 5. Backend — Shared Kernel

### 5.1 Entidad base `shared-kernel/Entity.ts`

```ts
export abstract class Entity<T> {
  protected readonly _id: number
  protected props: T

  constructor(props: T, id?: number) {
    this._id = id ?? 0
    this.props = props
  }

  get id(): number {
    return this._id
  }

  public equals(other: Entity<T>): boolean {
    if (other == null || other.constructor !== this.constructor) return false
    return this._id === other._id
  }
}
```

Reglas: `_id: 0` = entidad nueva; `_id > 0` = persistida. El repo muta el `_id` con
`(entity as any)._id = record.id`.

### 5.2 Errores de dominio `shared-kernel/Errors.ts`

```ts
export class NotFoundError extends Error {
  constructor(entity: string, id: string | number) {
    super(`${entity} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class AlreadyExistsError extends Error {
  field?: string
  constructor(entity: string, identifier: string) {
    super(`${entity} "${identifier}" ya existe`)
    this.name = 'AlreadyExistsError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Credenciales inválidas') { super(message); this.name = 'UnauthorizedError' }
}

export class ConflictError extends Error {
  code?: string
  constructor(message: string, code?: string) { super(message); this.name = 'ConflictError'; this.code = code }
}
```

### 5.3 Contexto por request `shared-kernel/AppContext.ts`

Uso `AsyncLocalStorage` para exponer `userId` y `roles` en toda la cadena sin pasarlos por parámetro.

```ts
import { AsyncLocalStorage } from 'async_hooks'

export type Role = string
export interface AppContext { userId: string; roles: Role[] }

const als = new AsyncLocalStorage<AppContext>()

export function getAppContext(): AppContext | undefined {
  return als.getStore()
}

export function runWithContext(context: AppContext, fn: () => void): void {
  als.run(context, fn)
}
```

### 5.4 Fechas `shared-kernel/Dates.ts` (helpers clave)

```ts
export const APP_TZ = 'America/Argentina/Buenos_Aires'

// Clock inyectable (para tests deterministas)
let clock: () => Date = () => new Date()
export function setClockForTests(fn: () => Date): void { clock = fn }
export function ahoraAR(): Date { return clock() }

// "YYYY-MM" AR de un instante real (creadoEn, periodo, now)
export function mesKeyOfInstant(d: Date): string {
  const { y, m } = arParts(d)
  return `${y}-${pad2(m)}`
}

// "YYYY-MM-DD" de una columna @db.Date (Prisma devuelve UTC-midnight)
export function dateKeyOfDateColumn(d: Date): string {
  return d.toISOString().slice(0, 10)
}
export function dateMonthKeyOfDateColumn(d: Date): string {
  return d.toISOString().slice(0, 7)
}

// Mes "YYYY-MM" de un CAMPO DE MES (ej. Pago.periodo). Solo el keying UTC es robusto.
export function mesKeyUTC(d: Date): string {
  return d.toISOString().slice(0, 7)
}

// "YYYY-MM-DD" -> instante medianoche AR
export function parseARDate(iso: string): Date {
  return new Date(`${iso}T00:00:00-03:00`)
}

export function mesSiguiente(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const anio = m === 12 ? y + 1 : y
  const mes = m === 12 ? 1 : m + 1
  return `${anio}-${String(mes).padStart(2, '0')}`
}
```

**Regla de oro:** columnas `@db.Date` → SOLO getters UTC (`toISOString().slice`);
instantes reales (`creadoEn`, `periodo`, `now`) → helpers `*OfInstant` / `getARDates`.

### 5.5 Precios con vigencia `shared-kernel/Precio.ts`

```ts
export interface PrecioVigencia { id: number; monto: number; fechaVigencia: Date }

export function precioVigenteEnFecha(precios: ReadonlyArray<PrecioVigencia>, fecha: Date): PrecioVigencia | null {
  let vigente: PrecioVigencia | null = null
  for (const p of precios) {
    if (p.fechaVigencia.getTime() <= fecha.getTime()) {
      if (!vigente || p.fechaVigencia.getTime() > vigente.fechaVigencia.getTime()) vigente = p
    }
  }
  return vigente
}

export function montoVigenteEnFecha(precios: ReadonlyArray<PrecioVigencia>, fecha: Date): number | null {
  const vigente = precioVigenteEnFecha(precios, fecha)
  return vigente ? vigente.monto : null
}

/** Devuelve una fn mesKey -> monto vigente. Antes de la 1ra vigencia cae al 1er precio. */
export function resolverMontoVigentePorMes(precios: ReadonlyArray<PrecioVigencia>): (mesKey: string) => number {
  const primero = precios.length
    ? precios.reduce((a, b) => (a.fechaVigencia <= b.fechaVigencia ? a : b)).monto
    : 0
  return (mesKey) => {
    const [y, m] = mesKey.split('-').map(Number)
    return montoVigenteEnFecha(precios, new Date(Date.UTC(y, m - 1, 1))) ?? primero
  }
}
```

### 5.6 Paginación `shared-kernel/Pagination.ts`

```ts
export interface PaginationInput { page: number; limit: number }
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function paginateQuery<T>(
  model: { findMany: (...args: any[]) => any; count: (...args: any[]) => any },
  params: PaginationInput,
  args?: { where?: any; orderBy?: any; include?: any },
): Promise<PaginatedResult<T>> {
  const skip = (params.page - 1) * params.limit
  const [data, total] = await Promise.all([
    model.findMany({ skip, take: params.limit, ...args }) as Promise<T[]>,
    model.count({ where: args?.where }) as Promise<number>,
  ])
  return { data, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) }
}
```

---

## 6. Backend — Infraestructura

### 6.1 Clientes Prisma (dos bases)

`infrastructure/prisma/client.ts` (principal):

```ts
import { PrismaClient, Prisma } from '@prisma/client'
import { config } from '../../config'
import { winstonLogger } from '../logger/logger'

export const prisma = new PrismaClient({
  log: ['warn', 'error', { level: 'query', emit: 'event' }],
})

if (config.logs.prismaQueries.enabled) {
  prisma.$on('query', (e: Prisma.QueryEvent) => {
    winstonLogger.info('prisma:query', {
      category: 'prisma',
      query: e.query,
      params: config.logs.prismaQueries.logParams ? e.params : undefined,
      queryDurationMs: e.duration,
      target: e.target,
    })
  })
}
```

Hay un segundo cliente `logs-client.ts` que apunta a `LOGS_DATABASE_URL` y usa el
schema de logs (`logs/schema.prisma`).

### 6.2 Factories de app `infrastructure/http/app.ts`

```ts
export function createApp(): express.Application {
  const app = express()
  const container = new Container()

  app.set('trust proxy', config.rateLimit.trustProxy)
  app.use(helmet())
  app.use(cors({ credentials: true, origin: /* ver config.cors */ }))
  app.use(createGlobalRateLimiter())
  app.use(express.json())
  app.use(cookieParser(config.cookie.secret))
  app.use(authMiddleware)      // decodifica sesión → AppContext
  app.use(requestLogger)       // log HTTP
  app.use(createRoutes(container))
  app.use(errorHandler)        // catch global (500)
  return app
}
```

**Orden del pipeline (importante):**

```
1. helmet
2. cors
3. rate limiter global
4. express.json()
5. cookieParser
6. authMiddleware (AsyncLocalStorage)
7. requestLogger
8. Routes
9. errorHandler (500)
```

### 6.3 Registro de rutas `infrastructure/http/routes.ts`

```ts
export function createRoutes(container: Container): Router {
  const router = Router()

  router.use('/api/auth/login', createLoginIpRateLimiter(), createLoginRateLimiter())
  router.use('/api/auth/refresh', createRefreshRateLimiter())
  router.use('/api/auth', createAuthRouter(container.getAuthAppService(), container.getUsuarioAppService()))
  router.use('/api/users', createUserRouter(container.getUsuarioAppService()))
  router.use('/api/clientes', createClienteRouter(container.getClienteAppService()))
  router.use('/api/servicios', createServicioRouter(container.getServicioAppService()))
  // ... etc
  router.get('/api/health', (_req, res) => { res.json({ status: 'ok' }) })
  return router
}
```

### 6.4 Entry point `infrastructure/http/server.ts`

```ts
async function main(): Promise<void> {
  const app = createApp()
  const server = app.listen(config.port, () => {
    console.log(`[Server] Running on http://localhost:${config.port}`)
  })
  const shutdown = async () => {
    console.log('[Server] Shutting down...')
    server.close()
    await closeLogger()   // flush batch de logs
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}
main().catch((err) => { console.error('[Fatal] Failed to start server', err); process.exit(1) })
```

### 6.5 Middlewares

**authMiddleware.ts** — lee cookie firmada `session`, verifica JWT, setea `AppContext`:

```ts
const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/logout', '/api/auth/refresh', '/api/health']

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (PUBLIC_PATHS.includes(req.path)) return next()

  const token = req.signedCookies[config.cookie.name]
  if (!token) { res.status(401).json({ error: 'Token requerido' }); return }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as { userId: number; email: string; roles: string[] }
    const context: AppContext = { userId: String(payload.userId), roles: payload.roles }
    runWithContext(context, () => next())
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
```

**auth.ts** — autorización por roles:

```ts
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const context = getAppContext()
    if (!context) { res.status(401).json({ error: 'No autenticado' }); return }
    if (roles.length > 0) {
      const hasAccess = roles.some((r) => context.roles.includes(r))
      if (!hasAccess) { res.status(403).json({ error: 'Acceso denegado' }); return }
    }
    next()
  }
}
```

**errorHandler.ts** — catch global:

```ts
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = (err as { status?: number }).status ?? 500
  const status = Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 500
  const expose = (err as { expose?: boolean }).expose === true
  const body = status === 500
    ? { error: 'Internal server error' }
    : { error: expose ? err.message : 'Bad request' }
  if (status === 500) appLog.error(err.message, { error: err.stack })
  res.status(status).json(body)
}
```

### 6.6 DI Container `infrastructure/di/container.ts`

DI manual (sin decorators ni frameworks). Cada `getXService()` construye repo + service.

```ts
export class Container {
  private readonly prisma: PrismaClient

  constructor() { this.prisma = prisma }

  getUsuarioAppService(): UsuarioAppService {
    const repo = new UserRepository(this.prisma)
    return new UsuarioAppService(repo)
  }

  getClienteAppService(): ClienteAppService {
    const repo = new ClienteRepository(this.prisma)
    const clienteServicioRepo = new ClienteServicioRepository(this.prisma)
    const pagoRepo = new PagoRepository(this.prisma)
    const servicioRepo = new ServicioRepository(this.prisma)
    const asistenciaRepo = new AsistenciaRepository(this.prisma)
    const userRepo = new UserRepository(this.prisma)
    const precioRepo = new PrecioRepository(this.prisma)
    return new ClienteAppService(repo, clienteServicioRepo, pagoRepo, servicioRepo, asistenciaRepo, userRepo, precioRepo)
  }

  getReporteAppService(): ReporteAppService {
    return new ReporteAppService(new ReporteRepository(this.prisma))
  }
}
```

---

## 7. Backend — Controllers

### 7.1 Helpers `controllers/helpers.ts`

```ts
export function sendError(res: Response, err: unknown): void {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message })
  } else if (err instanceof AlreadyExistsError) {
    const details = err.field ? { nested: { [err.field]: [err.message] } } : undefined
    res.status(409).json({ error: err.message, details })
  } else if (err instanceof ConflictError) {
    const body: { error: string; code?: string } = { error: err.message }
    if (err.code) body.code = err.code
    res.status(409).json(body)
  } else if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message })
  } else {
    const realErr = err as Error
    appLog.error(realErr.message, { error: realErr.stack })
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export function sendValidationError(res: Response, details: unknown): void {
  res.status(400).json({ error: 'Validation error', details })
}
export function sendBadRequest(res: Response, message: string): void {
  res.status(400).json({ error: message })
}

export async function ok<T>(res: Response, promise: Promise<T>, status = 200): Promise<void> {
  try {
    res.status(status).json(await promise)
  } catch (err) {
    sendError(res, err)
  }
}

export function parseId(req: Request): number | null {
  const id = Number(req.params.id)
  return isNaN(id) ? null : id
}
```

> **Nota:** hay `sendError` (mapea errores de dominio) y el `errorHandler` global (500).
> La mayoría de los handlers usa `ok(res, promise, status)` y no hace try/catch.

### 7.2 Ejemplo completo — `controllers/PagoController.ts`

```ts
import { Router, Request, Response } from 'express'
import { safeParse, flatten, InferOutput } from 'valibot'
import { authorize } from '../infrastructure/middleware/auth'
import { getAppContext } from '../shared-kernel/AppContext'
import { IPagoAppService } from '../modules/pagos/application/IPagoAppService'
import { ok, sendValidationError, sendBadRequest, sendError, parseId } from './helpers'
import { createPagoSchema, updatePagoSchema } from '../lib/validation'

function validateCreate(req: Request, res: Response): InferOutput<typeof createPagoSchema> | void {
  const parsed = safeParse(createPagoSchema, req.body)
  if (!parsed.success) { sendValidationError(res, flatten(parsed.issues)); return }
  return parsed.output
}

class PagoController {
  constructor(private readonly appService: IPagoAppService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = validateCreate(req, res)
    if (!data) return
    const context = getAppContext()
    const usuarioId = context?.userId ? Number(context.userId) : undefined
    ok(res, this.appService.create(data, usuarioId), 201)
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 12))
    const isAdmin = getAppContext()?.roles.includes('Administrador') ?? false
    ok(res, this.appService.list(
      { page, limit },
      isAdmin,
      req.query.search as string | undefined,
      req.query.metodoPago as string | undefined,
      req.query.periodo as string | undefined,
    ))
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, 'Invalid id')
    ok(res, this.appService.getById(id, getAppContext()?.roles.includes('Administrador') ?? false))
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, 'Invalid id')
    const isAdmin = getAppContext()?.roles.includes('Administrador') ?? false
    try {
      await this.appService.delete(id, isAdmin)
      res.status(204).send()
    } catch (err) { sendError(res, err) }
  }
}

export function createPagoRouter(appService: IPagoAppService): Router {
  const ctrl = new PagoController(appService)
  const router = Router()

  router.post('/', authorize('Administrador', 'Secretario'), ctrl.create)
  router.get('/', authorize('Administrador', 'Secretario'), ctrl.list)
  router.get('/last/:clienteId', authorize('Administrador', 'Secretario'), ctrl.lastByCliente)
  router.get('/:id/detalle', authorize('Administrador'), ctrl.detalle)
  router.get('/:id', authorize('Administrador', 'Secretario'), ctrl.getById)
  router.patch('/:id', authorize('Administrador', 'Secretario'), ctrl.update)
  router.delete('/:id', authorize('Administrador', 'Secretario'), ctrl.delete)

  return router
}
```

Convenciones del controller:
- **Clase** con handlers como **arrow functions**.
- Constructor recibe el app service **por interfaz** (`IPagoAppService`).
- Validación Valibot como función inline `validateX(req, res)` que devuelve `void` si falla.
- Rutas siempre dentro del archivo del controller.
- Exporta `createXRouter(service): Router`.

### 7.3 AuthController — seteo de cookies firmadas

```ts
private setAccessCookie(res: Response, token: string): void {
  res.cookie(config.cookie.name, token, {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: config.cookie.path,
    maxAge: config.cookie.maxAge,
    signed: true,
  })
}

login = async (req, res) => {
  const data = validateLogin(req, res)
  if (!data) return
  const result = await this.authService.login(data, requestMeta(req))
  this.setAccessCookie(res, result.token)
  this.setRefreshCookie(res, result.refreshToken)
  res.json({ user: result.user })
}
```

---

## 8. Backend — Application layer

Para cada dominio hay: **interfaz** `I<Dominio>AppService`, **implementación**
`<Dominio>AppService` y **DTOs** + mapper `toXResponseDTO`.

### 8.1 Interfaz `modules/pagos/application/IPagoAppService.ts`

```ts
export interface IPagoAppService {
  create(dto: CreatePagoDTO, usuarioId?: number): Promise<PagoResponseDTO>
  update(id: number, dto: UpdatePagoDTO, isAdmin?: boolean, usuarioId?: number): Promise<PagoResponseDTO>
  getById(id: number, isAdmin?: boolean): Promise<PagoResponseDTO>
  getLastByCliente(clienteId: number): Promise<PagoResponseDTO | null>
  list(params: PaginationInput, isAdmin?: boolean, search?: string, metodoPago?: string, periodo?: string): Promise<PaginatedResult<PagoResponseDTO>>
  delete(id: number, isAdmin?: boolean): Promise<void>
}
```

### 8.2 DTOs + mapper `modules/pagos/application/PagoDTO.ts`

```ts
export interface PagoResponseDTO {
  id: number
  clienteServicioId: number
  clienteId: number
  servicioId: number
  clienteNombre: string
  clienteApellido: string
  clienteDni: string | null
  servicioNombre: string | null
  periodo: string | null
  monto: number
  metodoPago: string
  fecha: string
  usuarioCreador: string | null
  usuarioModificador: string | null
  creadoEn: string
  actualizadoEn: string
}

export interface CreatePagoDTO {
  clienteServicioId?: number
  asignacion?: { clienteId: number; servicioId: number; fechaAsignacion?: string }
  periodo?: string
  monto: number
  metodoPago: string
  fecha: string
  confirmarPeriodoSinServicio?: boolean
}

export function toPagoResponseDTO(pago: PagoEntity & { clienteId: number; servicioId: number; clienteNombre: string; ... }): PagoResponseDTO {
  return {
    id: pago.id,
    clienteServicioId: pago.clienteServicioId,
    // ...
    periodo: pago.periodo ? pago.periodo.toISOString() : null,
    fecha: dateKeyOfDateColumn(pago.fecha),          // columnas @db.Date → keying UTC
    creadoEn: pago.creadoEn.toISOString(),
  }
}
```

### 8.3 Implementación — ejemplo de service con reglas (PagoAppService, fragmentos)

El service es donde vive la **lógica de negocio** y donde se **crean las entidades**
(nunca se reciben entidades de afuera).

```ts
export class PagoAppService implements IPagoAppService {
  constructor(
    private readonly pagoRepository: IPagoRepository,
    private readonly clienteRepository: IClienteRepository,
    private readonly clienteServicioRepository: IClienteServicioRepository,
    private readonly userRepository: IUserRepository,
    private readonly asistenciaRepository: IAsistenciaRepository,
    private readonly servicioRepository: IServicioRepository,
    private readonly precioRepository: IPrecioRepository,
  ) {}

  async create(dto: CreatePagoDTO, usuarioId?: number): Promise<PagoResponseDTO> {
    const usuarioNombre = await this.resolveNombre(usuarioId)
    const fechaDate = parseARDate(dto.fecha)   // parseo de wire siempre hora AR

    if (dto.asignacion) return this.crearConAsignacion(dto, usuarioNombre)

    const cs = await this.clienteServicioRepository.findById(dto.clienteServicioId!)
    let periodo: Date

    if (!cs.servicioEsPorSesiones) {
      const hist = await this.historialRecurrenteCliente(cs.clienteId)
      const proximo = proximoPeriodoPagable(cs.fechaAsignacion, hist.pagados, hist.asistencias, ahoraAR())
      // validaciones de regularización...
      periodo = new Date(dto.periodo ?? `${proximo}-01T12:00:00`)
    } else {
      // por sesiones: periodo = primer día del mes (o siguiente si ya pagó este mes)
      periodo = ... // ver código real
    }

    const pago = new PagoEntity({ clienteServicioId: cs.id, periodo, monto: dto.monto, metodoPago: dto.metodoPago, fecha: fechaDate, usuarioCreador: usuarioNombre }, )
    await this.pagoRepository.save(pago)
    const saved = await this.pagoRepository.findById(pago.id)
    return toPagoResponseDTO(saved)
  }

  private async resolveNombre(usuarioId?: number): Promise<string | undefined> {
    if (!usuarioId) return undefined
    const u = await this.userRepository.findById(usuarioId)
    return `${u.nombre} ${u.apellido}`
  }
}
```

> Patrón: el **service orquesta repos**, arma la **entidad**, llama a `save()`, vuelve a
> leer con relaciones y devuelve **DTO**. Los errores de negocio se lanzan como
> `ConflictError`/`NotFoundError`.

### 8.4 Un ABM simple — UsuarioAppService

```ts
export class UsuarioAppService implements IUsuarioAppService {
  constructor(private readonly userRepository: IUserRepository) {}

  async create(data: UserDTO): Promise<UserResponseDTO> {
    if (!Array.isArray(data.rolIds) || data.rolIds.length === 0) {
      throw new ConflictError('Debés asignar al menos un rol')
    }
    const hashed = await bcrypt.hash(data.contrasena, 10)
    const user = new UserEntity({
      email: data.email, contrasena: hashed, nombre: data.nombre, apellido: data.apellido,
    })
    user.rolIds = data.rolIds
    await this.userRepository.save(user)
    const saved = await this.userRepository.findById(user.id)
    return toUserResponseDTO(saved)
  }

  async list(params, keyword?) {
    const result = await this.userRepository.findAllPaginated(params, keyword)
    return { ...result, data: result.data.map(toUserResponseDTO) }
  }

  async getById(id: number): Promise<UserResponseDTO> {
    return toUserResponseDTO(await this.userRepository.findById(id))
  }
}
```

---

## 9. Backend — Domain layer

### 9.1 Entidad de dominio `modules/pagos/domain/PagoEntity.ts`

```ts
import { Entity } from '../../../shared-kernel/Entity'

export class PagoEntity extends Entity<{
  clienteServicioId: number
  periodo?: Date
  monto: number
  metodoPago: string
  fecha: Date
  usuarioCreador?: string
  usuarioModificador?: string
}> {
  creadoEn: Date
  actualizadoEn: Date

  constructor(props: { /* igual que el genérico */ }, id?: number) {
    super({ ...props }, id)
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get clienteServicioId(): number { return this.props.clienteServicioId }
  get periodo(): Date | undefined { return this.props.periodo }
  get monto(): number { return this.props.monto }

  updateInfo(data: { monto?: number; metodoPago?: string; fecha?: Date }): void {
    if (data.monto !== undefined) this.props.monto = data.monto
    if (data.metodoPago !== undefined) this.props.metodoPago = data.metodoPago
    this.actualizadoEn = new Date()
  }
}
```

### 9.2 Interfaz del repositorio `modules/pagos/domain/IPagoRepository.ts`

```ts
export interface IPagoRepository {
  save(pago: PagoEntity): Promise<void>
  findById(id: number): Promise<PagoWithRelations>          // lanza NotFoundError
  findLastByCliente(clienteId: number): Promise<PagoWithRelations | null>
  findAllPaginated(params: PaginationInput, since?: Date, search?: string, metodoPago?: string, periodo?: string): Promise<PaginatedResult<PagoWithRelations>>
  delete(id: number): Promise<void>
}
```

Puede declarar **tipos enriquecidos** que combinan la entidad con datos de relaciones:

```ts
export type PagoWithRelations = PagoEntity & {
  clienteId: number
  servicioId: number
  clienteNombre: string
  clienteApellido: string
  servicioNombre: string | null
  servicioActividades: ServicioActividadResumen[]
}
```

---

## 10. Backend — Repositorios

Identificación de la tabla: `infrastructure/repositories/PagoRepository.ts`.

### 10.1 Patrón `save` (create/update por `_id`)

```ts
async save(pago: PagoEntity): Promise<void> {
  if (pago.id > 0) {
    await this.prisma.pago.update({
      where: { id: pago.id },
      data: {
        periodo: pago.periodo, monto: pago.monto, metodoPago: pago.metodoPago,
        fecha: pago.fecha, usuarioModificador: pago.usuarioModificador,
      },
    })
  } else {
    const record = await this.prisma.pago.create({
      data: {
        clienteServicioId: pago.clienteServicioId,
        periodo: pago.periodo,
        monto: pago.monto,
        metodoPago: pago.metodoPago,
        fecha: pago.fecha,
        usuarioCreador: pago.usuarioCreador,
      },
    })
    ;(pago as any)._id = record.id   // mutación pragmática del id protegido
  }
}
```

### 10.2 Mapeo de errores Prisma → errores de dominio

```ts
async save(user: UserEntity): Promise<void> {
  // ...
  try {
    record = await this.prisma.usuario.create({ data: { /* ... */ } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AlreadyExistsError('Usuario', user.email)   // unique violation → 409
    }
    throw err
  }
  ;(user as any)._id = record.id
}

async delete(id: number): Promise<void> {
  try {
    await this.prisma.usuario.delete({ where: { id } })
  } catch {
    throw new NotFoundError('Usuario', id)   // delete inexistente → 404
  }
}
```

### 10.3 Conversión DB → dominio (mapper `toEntity` en el repo)

```ts
private toEntity(record: UsuarioWithRoles): UserEntity {
  const entity = new UserEntity(
    { email: record.email, contrasena: record.contrasena, nombre: record.nombre, apellido: record.apellido },
    record.id,
  )
  entity.creadoEn = record.creadoEn
  entity.actualizadoEn = record.actualizadoEn
  entity.rolIds = record.usuarioRoles.map(ur => ur.rol.id)
  entity.rolNombres = record.usuarioRoles.map(ur => ur.rol.nombre)
  return entity
}
```

### 10.4 Agregaciones y consultas complejas (ReporteRepository)

Los repos también resuelven **agregaciones** y razonan sobre la vigencia de precios:

```ts
async sumDeudaGlobal(corte: Date, servicioId?: number): Promise<number> {
  const todos = await this.prisma.clienteServicio.findMany({
    where: { esActivo: true, ...(servicioId !== undefined ? { servicioId } : {}) },
    include: { servicio: true },
  })
  // ... carga precios, pagos y recorre mes a mes con resolverMontoVigentePorMes
}
```

---

## 11. Backend — Validación con Valibot

Esquemas centralizados en `src/lib/validation.ts`. Convenciones:
- Sintaxis **`pipe()`** (no method chaining).
- `optional()` envuelve **todo el campo**.
- Helper `optStr` para "string ó vacío → undefined" (común en updates).

```ts
import { object, string, number, array, pipe, email, minLength, maxLength, integer, minValue, optional, regex, boolean, transform, unknown, partial, values, check } from 'valibot'

const optStr = (schema: any) =>
  pipe(unknown(), transform((v) => (v === '' || v === undefined ? undefined : v)), optional(schema))

export const createUserSchema = object({
  email: pipe(string(), email('Email inválido')),
  contrasena: pipe(string(), minLength(6, 'La contraseña debe tener al menos 6 caracteres')),
  nombre: pipe(string(), minLength(1, 'El nombre es requerido'), maxLength(255)),
  apellido: pipe(string(), minLength(1, 'El apellido es requerido'), maxLength(255)),
  rolIds: pipe(array(pipe(number(), integer(), minValue(1))), minLength(1, 'Al menos un rol es requerido')),
})

export const createPagoSchema = object({
  clienteServicioId: optional(pipe(number(), integer(), minValue(1))),
  asignacion: optional(object({
    clienteId: pipe(number(), integer(), minValue(1)),
    servicioId: pipe(number(), integer(), minValue(1)),
    fechaAsignacion: optional(pipe(string(), minLength(1))),
  })),
  monto: pipe(number('Debe ser un número'), minValue(0, 'El monto debe ser positivo')),
  metodoPago: pipe(string(), minLength(1, 'Método de pago requerido')),
  fecha: pipe(string(), minLength(1, 'Fecha requerida')),
  periodo: optional(pipe(string(), minLength(1))),
})

export const loginSchema = object({
  email: pipe(string(), email('Email inválido')),
  password: pipe(string(), minLength(1, 'Contraseña requerida')),
})
```

Uso en el controller:

```ts
const parsed = safeParse(createPagoSchema, req.body)
if (!parsed.success) {
  sendValidationError(res, flatten(parsed.issues))   // -> { nested: { campo: [errores] } }
  return
}
```

---

## 12. Backend — Prisma / Base de datos

Convenciones del schema (`infrastructure/prisma/schema.prisma`):

- IDs autoincrementales: `Int @id @default(autoincrement())`.
- **Fechas de calendario** (no instantes) → `DateTime @db.Date` (se keyean con UTC).
- **Instantes reales** → `DateTime @default(now())` + `@updatedAt`.
- Enums de Prisma para tipos cerrados (`enum TipoMovimiento { INGRESO EGRESO }`).
- Índices en FKs y buckets de búsqueda (`@@index([clienteServicioId])`, `@@index([fecha])`).
- Precios con vigencia: `@@unique([servicioId, fechaVigencia])`.
- Deletes dependientes: `onDelete: Cascade` en las FKs hijo→padre.
- Soft delete donde corresponde: `deletedAt DateTime?`.

Modelos de ejemplo (resumen):

```prisma
model Usuario {
  id             Int        @id @default(autoincrement())
  email          String     @unique
  nombre         String
  apellido       String
  contrasena     String
  activo         Boolean    @default(true)
  usuarioRoles   UsuarioRol[]
  creadoEn       DateTime   @default(now())
  actualizadoEn  DateTime   @updatedAt
}

model Rol {
  id       Int        @id @default(autoincrement())
  nombre   String     @unique
  usuarios UsuarioRol[]
  rolMenus RolMenu[]
}

model Cliente {
  id               Int       @id @default(autoincrement())
  dni              String?   @unique
  nombre           String
  apellido         String
  creadoEn         DateTime  @default(now())
  actualizadoEn    DateTime  @updatedAt
  clienteServicios ClienteServicio[]
}

model Servicio {
  id        Int      @id @default(autoincrement())
  nombre    String
  activo    Boolean  @default(true)
  creadoEn  DateTime @default(now())
  clienteServicios ClienteServicio[]
  preciosServicio  PrecioServicio[]
}

model ClienteServicio {
  id              Int      @id @default(autoincrement())
  clienteId       Int
  servicioId      Int
  fechaAsignacion DateTime @db.Date
  esActivo        Boolean  @default(true)
  cliente         Cliente  @relation(fields: [clienteId], references: [id], onDelete: Cascade)
  servicio        Servicio @relation(fields: [servicioId], references: [id])
  pagos           Pago[]
  asistencias     Asistencia[]
  @@index([clienteId])
  @@index([esActivo])
}

model Pago {
  id                Int      @id @default(autoincrement())
  clienteServicioId Int
  periodo           DateTime?   // campo de mes → mesKeyUTC
  monto             Decimal  @db.Decimal(10, 2)
  metodoPago        String
  fecha             DateTime @db.Date
  clienteServicio   ClienteServicio @relation(fields: [clienteServicioId], references: [id])
  @@index([clienteServicioId])
  @@index([fecha])
}

model PrecioServicio {
  id            Int      @id @default(autoincrement())
  servicioId    Int
  monto         Decimal  @db.Decimal(10, 2)
  fechaVigencia DateTime @db.Date
  servicio      Servicio @relation(fields: [servicioId], references: [id], onDelete: Cascade)
  @@unique([servicioId, fechaVigencia])
}
```

**Migrations como seed:** los roles/menús/actividades por defecto se insertan en
**migraciones** (`migration.sql` con `INSERT ... ON CONFLICT DO NOTHING`), no en el seed
del admin. El `seed.ts` solo asegura el usuario admin.

`seed.ts` (admin):

```ts
const adminRol = await prisma.rol.findUnique({ where: { nombre: 'Administrador' } })
if (!adminRol) { console.error('Rol Administrador no encontrado'); process.exit(1) }
const hashed = await bcrypt.hash('admin123', 10)
await prisma.usuario.upsert({
  where: { email: 'admin@kinesiocenter.com' },
  update: { contrasena: hashed },
  create: { email: 'admin@kinesiocenter.com', contrasena: hashed, nombre: 'Admin', apellido: 'KinesioCenter',
           usuarioRoles: { create: [{ rolId: adminRol.id }] } },
})
```

---

## 13. Backend — Logging

### 13.1 Facade `appLog` (loguear desde cualquier capa)

```ts
export const appLog = {
  info:  (msg: string, meta?: object) => winstonLogger.info(msg,  withTrace(meta)),
  warn:  (msg: string, meta?: object) => winstonLogger.warn(msg,  withTrace(meta)),
  error: (msg: string, meta?: object) => winstonLogger.error(msg, withTrace(meta)),
  debug: (msg: string, meta?: object) => winstonLogger.debug(msg, withTrace(meta)),
}

// Uso:
// import { appLog } from '../infrastructure/logger/logger'
// appLog.info('mensaje', { userId: 5, foo: 'bar' })
```

### 13.2 Transport a DB de logs (lazy / distant)

`AsyncBatchTransport` acumula entradas y las persiste en un **flush batch** a la DB de
logs (tablas `ApiLog`, `AppLog`, `PrismaQueryLog`), con intervalo/batch configurados por
env. `closeLogger()` hace el flush final en el graceful shutdown.

---

## 14. Backend — Convenciones y naming

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Módulos | inglés plural | `users`, `pagos`, `clientes` |
| Entidad | inglés | `UserEntity`, `PagoEntity` |
| App service | español | `UsuarioAppService`, `PagoAppService` |
| Controller | inglés | `UserController`, `PagoController` |
| DTOs | inglés | `UserResponseDTO`, `CreatePagoDTO` |
| Interfaz repo/service | prefijo `I` | `IUserRepository`, `IPagoAppService` |
| Archivos | PascalCase | `UserController.ts`, `PagoDTO.ts` |
| Fechas wire | `YYYY-MM-DD` / `YY-MM` | `fecha`, `periodo`, `mes` |
| Errores | español en mensajes al usuario | `'Debés regularizar primero ...'` |

Reglas duras:
- El `_id` protegido se muta desde el repo vía `(entity as any)._id` (pragmático).
- No usar decorators ni frameworks de DI.
- No hay carpetas `infrastructure/` dentro de `modules/` — los repos van en
  `infrastructure/repositories/`.
- Regenerar ambos Prisma clients tras cambios de schema:
  `pnpm db:generate && pnpm db:generate:logs`.

---

## 15. Frontend — Estructura de la app

Next.js 14 App Router. Convenciones de cada módulo:

```
app/(authenticated)/<modulo>/
  page.tsx            # Server Component: fetch SSR inicial + <Manager initialData={...}>
  loading.tsx         # skeleton
  _components/
    <Modulo>Manager.tsx   # client: estado, filtros, useCrud, renderiza <List> + <FormModal>
    <Modulo>List.tsx      # client: define columns del DataTable + acciones
    <Modulo>FormModal.tsx # client: CrudFormModal + schema espejo (front/lib/validation.ts)
```

### 15.1 `page.tsx` (Server Component con fetch inicial)

```tsx
import { cookies } from 'next/headers'
import { ClientesManager } from './_components/ClientesManager'
import { getClientes } from '../../../services/clientes'
import { readPageSize } from '../../../lib/pageSizeCookie'
import type { PaginatedResponse } from '../../../types/pagination'
import type { ClienteResponseDTO } from '../../../types/cliente'

export default async function ClientesPage() {
  const pageSize = readPageSize(await cookies(), 'pageSize_clientes')
  const initialData = await getClientes(1, pageSize).catch((): PaginatedResponse<ClienteResponseDTO> => ({
    data: [], total: 0, page: 1, limit: pageSize, totalPages: 0,
  }))

  return (
    <div className="p-8 flex flex-col flex-1 min-h-0">
      <ClientesManager initialData={initialData} />
    </div>
  )
}
```

> `services/` devuelven datos tipados y funcionan **tanto en server como en client**
> (el apiClient decide la URL según el contexto). El manager solo consume datos.

---

## 16. Frontend — Autenticación y sesión

### 16.1 Login

`src/app/_components/LoginPage.tsx`: form con `id="email"` y `id="password"`, llama
`login(email, password)` → `GET /api/auth/me` para elegir redirect según rol, y hace
`router.push` + `router.refresh()`.

```ts
import { login, getMe } from '../../services/auth'

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  setLoading(true)
  try {
    await login(email, password)
    let redirectTo = '/dashboard'
    try {
      const me = await getMe()
      if (me && me.user.roles.length === 1 && me.user.roles[0] === 'Asistencia') redirectTo = '/asistencia'
    } catch {}
    router.push(redirectTo)
    router.refresh()
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Error de conexión con el servidor')
  } finally {
    setLoading(false)
  }
}
```

### 16.2 cookie + middleware

- Las cookies (`session` firmadas httpOnly) las setea el backend.
- `src/middleware.ts` **decodifica el JWT de la cookie firmada** (server-side, solo para
  redireccionar) y protege las rutas:

```ts
const COOKIE_NAME = process.env.COOKIE_NAME ?? 'session'
const LOGIN_PAGE = '/'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const rawCookie = request.cookies.get(COOKIE_NAME)?.value
  const jwt = rawCookie ? extractJwtFromSignedCookie(rawCookie) : null
  const payload = jwt ? decodeToken(jwt) : null

  if (!payload || !payload.roles) {
    if (pathname === LOGIN_PAGE) return NextResponse.next()
    return NextResponse.redirect(new URL(LOGIN_PAGE, request.url))
  }
  if (pathname === LOGIN_PAGE) {
    const isAsistenciaOnly = payload.roles.length === 1 && payload.roles[0] === 'Asistencia'
    return NextResponse.redirect(new URL(isAsistenciaOnly ? '/asistencia' : '/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/', '/dashboard/:path*', '/clientes/:path*', /* ... */] }
```

### 16.3 apiClient (server + client, refresh automático)

`src/lib/apiClient.ts` — punto único de fetch:
- En **server** (server actions/SSR) fetchea directo a `API_URL` (backend) y propaga
  cookies vía `next/headers`.
- En **client** fetchea a `/api/...` (el rewrite de Next lo manda al backend).
- En 401 (fuera de paths de auth) intenta `POST /api/auth/refresh` una vez y reintenta.
- Tira `ApiError(status, message, details, code)`.

```ts
const BASE_URL = (process.env.API_URL ?? 'http://localhost:3001').replace(/\/+$/, '')
const AUTH_PATHS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout']

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    return await request<T>(path, options)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !AUTH_PATHS.includes(path)) {
      const refreshed = await refreshSession()
      if (refreshed) return request<T>(path, options)
    }
    throw err
  }
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly details?: unknown, public readonly code?: string) {
    super(message)
    this.name = 'ApiError'
  }
}
```

### 16.4 services/auth.ts

```ts
export async function login(email: string, password: string): Promise<LoginResult> {
  return apiClient<LoginResult>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}
export async function logout(): Promise<void> {
  await apiClient<{ message: string }>('/api/auth/logout', { method: 'POST' })
}
export async function getMe(): Promise<LoginResult | null> {
  try { return await apiClient<LoginResult>('/api/auth/me') }
  catch (err) { if (err instanceof ApiError && err.status === 401) return null; throw err }
}
```

---

## 17. Frontend — AppShell, Sidebar y contexto

### 17.1 `(authenticated)/layout.tsx`

```tsx
// (authenticated)/layout.tsx
import { AppShell } from './_components/AppShell'

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
```

### 17.2 AppShell (client) — carga user + menus, navegación client-side

```tsx
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserResponseDTO | null>(null)
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [navTarget, setNavTarget] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleNavigate(href: string) {
    setNavTarget(href)
    startTransition(() => router.push(href))   // navegación client-side con transición
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [userResult, menuList] = await Promise.all([getMe(), getMisMenus()])
        if (!mounted) return
        if (!userResult) { router.push('/'); return }
        setUser(userResult.user)
        setMenus(menuList)
      } catch {
        if (mounted) router.push('/')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [router])

  if (loading) return <SidebarSkeleton />   // muestra skeleton hasta resolver auth

  return (
    <UserProvider user={user!} menus={menus}>
      <Sidebar user={user!} onNavigate={handleNavigate} navTarget={navTarget} isNavigating={isPending} />
      <main className={`h-screen bg-bg pt-14 lg:pt-0 flex flex-col overflow-y-auto lg:ml-[max(240px,25vw)]`}>
        {isPending && navTarget ? <AbmSkeleton /> : children}
      </main>
    </UserProvider>
  )
}
```

### 17.3 UserProvider + AuthContext

```tsx
// _components/UserProvider.tsx
export function UserProvider({ user, menus, children }: Props) {
  return <AuthContext.Provider value={{ user, menus }}>{children}</AuthContext.Provider>
}

// context/AuthContext.tsx
export function useUser(): UserResponseDTO {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx.user
}
export function useMenus(): MenuItem[] {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useMenus must be used within a UserProvider')
  return ctx.menus
}
```

### 17.4 Sidebar completo (estética base, desktop + mobile)

```tsx
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeftRight, BarChart3, ChevronDown, ChevronLeft, ChevronRight,
         CircleDollarSign, ClipboardList, Dumbbell, LayoutDashboard, LogOut,
         ScanFace, Tags, UserRound, Users, Wallet } from 'lucide-react'
import { logout } from '../../../services/auth'
import { SidebarLink } from './SidebarLink'
import { useMenus } from '../../../context/AuthContext'
import type { UserResponseDTO } from '../../../types/user'

export function Sidebar({ user, collapsed = false, onToggle, onNavigate, navTarget = null, isNavigating = false }: SidebarProps) {
  const menus = useMenus()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() { await logout(); router.push('/') }

  const menuIcons: Record<string, React.ReactNode> = {
    '/dashboard': <LayoutDashboard size={20} />, '/usuarios': <Users size={20} />,
    '/clientes': <UserRound size={20} />, '/servicios': <ClipboardList size={20} />,
    '/actividades': <Dumbbell size={20} />, '/pagos': <CircleDollarSign size={20} />,
    '/asistencia': <ScanFace size={20} />, '/cajas': <Wallet size={20} />,
    '/movimientos': <ArrowLeftRight size={20} />, '/conceptos': <Tags size={20} />,
    '/reportes': <BarChart3 size={20} />,
  }

  return (
    <>
      {/* Mobile: top bar + dropdown */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 shadow-md">
        <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-4 h-14 bg-secondary text-white"
          aria-expanded={open} aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white text-xs font-bold shrink-0">
              {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
            </div>
            <span className="text-sm font-medium truncate">{user?.nombre} {user?.apellido}</span>
          </div>
          <ChevronDown size={20} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        <div className={`grid transition-[grid-template-rows] duration-200 ease-out bg-secondary ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden shadow-lg">
            <nav className="px-3 py-2 border-t border-white/10">
              <ul className="space-y-0.5">
                {menus.map((item) => (
                  <SidebarLink key={item.url} href={item.url} icon={getMenuIcon(item.url)}
                    label={item.nombre} active={isActive(item.url)} onClick={() => onNavigate?.(item.url)} />
                ))}
              </ul>
            </nav>
            <div className="px-3 py-3 border-t border-white/10">
              <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex fixed top-0 left-0 z-40 h-full flex-col overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? 'lg:w-[72px]' : 'lg:w-[max(240px,25vw)]' }`}
        style={{
          background: `radial-gradient(120% 90% at 15% 8%, rgba(109,153,224,0.28), transparent 55%),
                       radial-gradient(110% 110% at 90% 100%, rgba(109,153,224,0.16), transparent 60%),
                       linear-gradient(168deg, #34425C 0%, #263247 58%, #1d2739 100%)`,
        }}>
        {/* halo decorativo */}
        <div className="hidden lg:block absolute -right-[25%] -bottom-[35%] w-[34rem] h-[34rem] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(109,153,224,0.30), transparent 62%)', animation: 'breathe 9s ease-in-out infinite' }} />

        <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-5">
          <ul className="space-y-1">
            {menus.map((item) => (
              <SidebarLink key={item.url} href={item.url} icon={getMenuIcon(item.url)}
                label={item.nombre} collapsed={collapsed} active={isActive(item.url)}
                onClick={() => onNavigate?.(item.url)} />
            ))}
          </ul>
        </nav>

        <div className="relative z-10 px-4 py-5 border-t border-white/10">
          <div className={`flex items-center gap-3 rounded-xl mb-2 ${collapsed ? 'pl-0 pr-0 py-3' : 'bg-white/5 pl-4 pr-4 py-3'}`}>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white text-sm font-bold shrink-0">
              {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
            </div>
            <div className={`min-w-0 overflow-hidden transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0 -ml-3' : 'max-w-[200px] opacity-100'}`}>
              <p className="text-base font-semibold text-white truncate">{user?.nombre} {user?.apellido}</p>
              <p className="text-sm text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 py-3 rounded-md text-[15px] font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all">
            <LogOut size={20} className="shrink-0" />
            <span className="overflow-hidden whitespace-nowrap transition-all duration-500">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
```

### 17.5 SidebarLink — navegación con transición del AppShell

```tsx
export function SidebarLink({ href, icon, label, collapsed = false, onClick, active = false }: Props) {
  return (
    <li>
      <Link href={href} title={collapsed ? label : undefined}
        onClick={(e) => {
          e.preventDefault()          // la navegación la maneja el AppShell
          onClick?.()
        }}
        className={`flex items-center gap-3 py-3 rounded-lg text-[15px] font-medium transition-all duration-500
          ${collapsed ? 'pl-2.5 pr-2.5' : 'pl-4 pr-4'}
          ${active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
        <span className="shrink-0">{icon}</span>
        <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0 -ml-3' : 'max-w-[200px] opacity-100'}`}>
          {label}
        </span>
      </Link>
    </li>
  )
}
```

---

## 18. Frontend — Patrón Manager + List + useCrud

### 18.1 `useCrud` — estado de listado con paginación server-side

`src/lib/useCrud.ts` maneja: datos, página, pageSize (persistido en cookie), loading,
búsqueda con debounce (300ms), open/close del modal ABM, edit/create target y refresh.

```ts
export function useCrud<T>({ fetchFn, initialData, defaultPageSize = 12, storageKey, routePath }: UseCrudOptions<T>): CrudState<T> {
  const [data, setData] = useState<T[]>(initialData.data)
  const [page, setPage] = useState(initialData.page)
  const [totalPages, setTotalPages] = useState(initialData.totalPages)
  const [pageSize, setPageSizeState] = useState(initialData.limit || defaultPageSize)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [search, setSearchState] = useState('')
  const searchRef = useRef('')

  const refreshData = useCallback(async (targetPage?: number, targetPageSize?: number, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const result = await fetchFn(targetPage ?? page, targetPageSize ?? pageSize, searchRef.current)
      setData(result.data); setPage(result.page); setTotalPages(result.totalPages)
    } catch {
      toast.error('Error al cargar los datos. Intentá de nuevo.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [page, pageSize, fetchFn])

  const setSearch = useCallback((value: string) => {
    setSearchState(value); searchRef.current = value
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => refreshData(1), 300)
  }, [refreshData])
  // ... handlePageChange, handleEdit, handleCreate, handleClose, setPageSize
  return { data, page, totalPages, pageSize, loading, showModal, selectedItem, search, setSearch, setPageSize, refreshData, handlePageChange, handleEdit, handleCreate, handleClose }
}
```

### 18.2 Manager — estado + filtros + render del listado y del modal

```tsx
'use client'
export function ClientesManager({ initialData }: ClientesManagerProps) {
  const [filtroAdeuda, setFiltroAdeuda] = useState(false)
  const adeudaRef = useRef(false)

  const fetchFn = useCallback(
    (page, pageSize, search?) => getClientes(page, pageSize, search, adeudaRef.current, false, false),
    [],
  )

  const crud = useCrud<ClienteResponseDTO>({ fetchFn, initialData, storageKey: 'pageSize_clientes', routePath: '/clientes' })

  return (
    <div className="space-y-6 flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-normal text-text-primary mb-1">Clientes</h1>
          <p className="text-text-secondary">Gestioná los clientes del sistema</p>
        </div>
        <button onClick={crud.handleCreate} className="px-4 py-2 rounded-md bg-accent text-white font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors whitespace-nowrap">
          + Crear nuevo
        </button>
      </div>

      <ClienteList crud={crud} filters={[]} onToggleAdeuda={() => { const n = !filtroAdeuda; setFiltroAdeuda(n); adeudaRef.current = n; crud.refreshData(1) }} />

      {crud.showModal && (
        <ClienteFormModal cliente={crud.selectedItem ?? undefined} onClose={crud.handleClose} onSuccess={() => crud.refreshData(1)} />
      )}
    </div>
  )
}
```

### 18.3 List — columnas del DataTable + acciones

```tsx
export function ClienteList({ crud, /* ... */ }: ClienteListProps) {
  const columns: DataTableColumn<ClienteResponseDTO>[] = useMemo(
    () => [
      { key: 'nombre', header: 'Nombre', render: (c) => <span className="text-sm text-text-primary font-medium">{c.nombre}</span> },
      { key: 'servicioActivo', header: 'Servicio',
        render: (c) => c.servicioActivo
          ? <span className="text-sm text-text-secondary">{c.servicioActivo}</span>
          : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-light text-warning">Sin Servicio</span> },
      { key: 'nivelDeuda', header: 'Deuda', width: '110px',
        render: (c) => c.nivelDeuda > 0 ? <NivelDeudaBadge nivelDeuda={c.nivelDeuda} /> : <NivelDeudaBadge nivelDeuda={0} /> },
    ],
    [],
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={crud.data}
        keyExtractor={(c) => c.id}
        loading={crud.loading}
        emptyMessage="No hay clientes aún. Creá uno nuevo."
        serverSideSearch
        page={crud.page} totalPages={crud.totalPages} onPageChange={crud.handlePageChange}
        pageSize={crud.pageSize} onPageSizeChange={crud.setPageSize}
        search={crud.search} onSearchChange={crud.setSearch}
        rowClassName={(c) => nivelDeudaRowClass(c.nivelDeuda)}
        renderActions={(c) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => crud.handleEdit(c)} className="p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors" title="Editar cliente"><Pencil size={16} /></button>
            <button onClick={() => setDetalleTarget(c)} className="p-2 rounded-md text-text-tertiary hover:text-accent hover:bg-accent-light transition-colors" title="Ver servicios y deuda"><Layers size={16} /></button>
            <button onClick={() => setDeleteTarget(c)} className="p-2 rounded-md text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors" title="Eliminar"><Trash2 size={16} /></button>
          </div>
        )}
      />
      {/* modales: ClienteServiciosActivosModal, ClienteFormModal vía crud, ConfirmModal de delete */}
    </>
  )
}
```

### 18.4 DataTable — API de props (componente base)

```tsx
export interface DataTableColumn<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  className?: string
  hideOnMobile?: boolean
  width?: string
}

export interface DataTableFilter {
  key: string
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  loading?: boolean
  emptyMessage?: string
  page?: number; totalPages?: number; onPageChange?: (page: number) => void
  pageSize?: number; onPageSizeChange?: (size: number) => void
  search?: string; onSearchChange?: (value: string) => void
  searchFilter?: (item: T, search: string) => boolean
  filters?: DataTableFilter[]
  filterExtra?: ReactNode
  onEdit?: (item: T) => void; onDelete?: (item: T) => void
  renderActions?: (item: T) => ReactNode
  renderCard?: (item: T) => ReactNode
  rowClassName?: (item: T) => string
  serverSideSearch?: boolean
  actionsIconCount?: number
}
```

---

## 19. Frontend — Server Actions y Services

### 19.1 Server Actions (`src/actions/cliente.ts`)

```ts
'use server'
import { revalidatePath } from 'next/cache'
import { apiClient } from '@/lib/apiClient'
import { actionError } from '@/lib/actionResult'
import type { ActionResult } from '@/lib/actionResult'
import type { ClienteResponseDTO, CreateClienteDTO, UpdateClienteDTO } from '../types/cliente'

export async function createCliente(dto: CreateClienteDTO): Promise<ActionResult<ClienteResponseDTO>> {
  try {
    const data = await apiClient<ClienteResponseDTO>('/api/clientes', { method: 'POST', body: JSON.stringify(dto) })
    revalidatePath('/clientes')
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deleteCliente(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/clientes/${id}`, { method: 'DELETE' })
    revalidatePath('/clientes')
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}
```

### 19.2 `actionResult.ts` — tipo e intérprete de errores

```ts
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; code?: string; fieldErrors?: Record<string, string[]> }

export function actionError(err: unknown): ActionResult<never> {
  const status = isApiError(err) ? err.status : 0
  const message = isApiError(err) ? err.message : 'Error de conexión con el servidor'
  const details = isApiError(err) ? err.details : undefined
  if (status && details) {
    const fieldErrors = parseFieldErrors(details)   // { nested: { campo: [] } } → Record<string, string[]>
    return { ok: false, status, error: fieldErrors ? 'Error de validación' : message, code, fieldErrors: fieldErrors ?? undefined }
  }
  return { ok: false, status, error: message, code }
}
```

### 19.3 Services (`src/services/reportes.ts`)

```ts
export async function getReportePagos(mes: string, servicioId?: number, serie = 6): Promise<ReportePagosDTO> {
  const params = new URLSearchParams({ mes, serie: String(serie) })
  if (servicioId) params.set('servicioId', String(servicioId))
  return apiClient<ReportePagosDTO>(`/api/reportes/pagos?${params}`)
}
```

Regla: **escrituras** → Server Actions (`actions/`); **lecturas de catálogos / SSR** → `services/`.

---

## 20. Frontend — Tipos espejo

Los tipos del front son **espejo exacto** de los DTOs del back (mismo nombre, mismas
formas). Ejemplo `types/user.ts`:

```ts
export interface UserResponseDTO {
  id: number
  email: string
  nombre: string
  apellido: string
  roles: string[]
  creadoEn: string
  actualizadoEn: string
}

export interface CreateUserDTO { email: string; contrasena: string; nombre: string; apellido: string; rolIds: number[] }
export interface UpdateUserDTO { email?: string; contrasena?: string; nombre?: string; apellido?: string; rolIds?: number[] }
```

Y `types/pagination.ts`:

```ts
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

> Cuando el back agrega un campo a un DTO, se agrega también acá. No hay "type safe" a
> través del wire más allá de esta convención manual.

---

## 21. Frontend — Componentes base

Todos en `src/components/`. Detalles clave para replicarlos:

### 21.1 `InputField` — id = name, label accessible

```tsx
export function InputField({ id, name = id, label, type = 'text', value, onChange, disabled, error, required, placeholder }: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <input
        id={id} name={name} type={type} value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled} placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-md border bg-white text-text-primary placeholder-text-tertiary
          focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary disabled:opacity-50 disabled:bg-bg-secondary
          ${error ? 'border-danger' : 'border-border'}`}
      />
      {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
    </div>
  )
}
```

### 21.2 `Select` — dropdown custom con portal

API: `options`, `value`, `onChange`, `label?`, `id?`, `placeholder?`, `disabled`, `dropUp?`, `centerOptions?`.

- Trigger: `<button role="combobox">` con `id` y `aria-label` (cuando hay label).
- Dropdown: `createPortal` a `document.body`, `ul` con opciones `role="option"`.
- Estilos: `justify-between`, chevron `ChevronDown`, scroll fino `.select-dropdown-scroll`.

```tsx
export function Select({ options, value, onChange, name, label, id, placeholder, className, dropUp = false, centerOptions = false }: SelectProps) {
  // estado: open, focusIdx, pos (fixed positioning)
  const selectedLabel = placeholder && !value ? placeholder : (options.find((o) => o.value === value)?.label ?? '')

  const button = (
    <button type="button" id={id} aria-label={label || undefined}
      onClick={() => { if (!open) openMenu(); else closeMenu() }}
      className={`w-full flex items-center justify-between border bg-white text-sm px-3 py-2 rounded-md ${error ? 'border-danger' : 'border-border'}`}
      role="combobox" aria-expanded={open} aria-haspopup="listbox">
      <span className={!value ? 'text-text-tertiary' : 'text-text-primary truncate'}>{selectedLabel}</span>
      <ChevronDown size={16} className={`text-text-tertiary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  )

  const dropdown = open && pos ? createPortal(
    <div style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }} className="z-[60] bg-white border border-border rounded-md shadow-lg overflow-hidden">
      <div className="select-dropdown-scroll max-h-60 overflow-y-auto py-1">
        {options.map((opt, i) => (
          <button key={opt.value} role="option" onClick={() => { onChange(opt.value); closeMenu() }}
            className={`w-full ${centerOptions ? 'text-center' : 'text-left'} px-3 py-2 text-sm
              ${opt.value === value ? 'bg-accent text-white font-medium' : 'hover:bg-bg-secondary text-text-primary'}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>, document.body) : null

  return <div ref={ref}>{label && <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>}{button}{dropdown}</div>
}
```

### 21.3 `SearchableSelect` — combo con búsqueda async

API: `options`, `value`, `onChange`, `onSearch?`, `selectedLabel?`, `placeholder`,
`searchMinLength` (default 2), `debounceMs` (300), `maxResults` (5). Usado para "Buscar
cliente por nombre o DNI...".

Comportamiento: input con `role="combobox"`, al tipear abre dropdown y llama `onSearch`
con debounce; las opciones tienen `role="option"`. Al seleccionar se cierra y limpia el
query. Muestra "Buscando..." mientras carga y "Sin resultados" si no hay.

### 21.4 `DatePicker` — id obligatorio, input + popup

API: `id`, `label?`, `value`, `onChange`, `mode: 'date' | 'month'`, `min`, `max`, `disabled`, `error`.
- El input acepta `DD/MM/YYYY` (date) o `M/YYYY` (month) y commitea con Enter/Blur.
- Popup con navegación de días/meses/años; en `mode="month"` se elige directamente el mes.
- Renderiza `<input type="hidden" name={id}>` con el valor ISO para formularios.

```tsx
// commitInput (resumen)
function commitInput() {
  if (mode === 'month') {
    const m = inputText.match(/^(\d{1,2})\/(\d{4})$/)
    if (m) { const [monthNum, year] = [Number(m[1]), Number(m[2])]; commitValue(formatISO(new Date(year, monthNum - 1, 1))) }
  } else {
    const iso = parseUserInput(inputText, min, max)
    if (iso) commitValue(iso)
  }
}
```

### 21.5 `CrudFormModal` — formulario ABM estándar

API: `open`, `onClose`, `onSuccess`, `title`, `schema` (Valibot), `submitLabel`,
`successMessage`, `onSubmitAction`, `className?`, `hideFooter?`. Children reciben
`(fieldErrors, loading, onClose)`.

```tsx
async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const form = new FormData(e.currentTarget)
  const values: Record<string, any> = {}
  form.forEach((v, k) => { /* agrupa duplicados en array */ })
  const parsed = safeParse(schema, values)
  if (!parsed.success) {
    const nested = flatten(parsed.issues).nested
    setFieldErrors(...)   // { campo: [errores] }
    return
  }
  const result = await onSubmitAction(parsed.output)
  if (!result.ok) {
    if (result.fieldErrors) setFieldErrors(result.fieldErrors)
    else if (result.status) handleActionError(result)
    else if (result.error) toast.error(result.error)
    return
  }
  await onSuccess(); onClose(); toast.success(successMessage)
}
```

Render vía `createPortal` con fondo `bg-black/40`, card `animate-card-in`, header con
`title` + `aria-label="Cerrar"`, footer `Cancelar` + submit (AsyncButton).

### 21.6 Otros componentes base

- **`AsyncButton`**: `<button>` con `loading` → spinner; variantes `primary|secondary|danger|ghost`, sizes.
- **`Toggle`**: switch con `role="switch"` y `aria-checked`.
- **`ConfirmModal`**: `open`, `title`, `message`, `confirmLabel` (danger por defecto).
- **`InfoModal`**: `open`, `onClose`, `title`, `children`, `size: 'sm'|'md'|'lg'` (max-w-md/2xl/4xl).
- **`KpiCard`**: `label`, `value`, `sub?`, `tone: accent|success|warning|danger|info|secondary`
  (borde izquierdo + dot), `delta?` (tag pill % con `+`/`-`/0), `help?` (abre InfoModal sm).
- **`SmoothHeight`**: anima la altura del contenido (transición `grid-template-rows`).
- **`Spinner`**: anillo de carga.
- **`Pagination` / `DataTable`**: paginación con elipsis + selector "por página".
- **`NivelDeudaBadge` / `DeudaBadge`**: pills semánticas con `bg-*-light text-*`.

Estilo de pill semántica (patrón onómico a reproducir):

```tsx
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-light text-success border border-success">Al día</span>
```

---

## 22. Frontend — Sistema de diseño

### 22.1 Tokens en `tailwind.config.js` (todos mapean a CSS vars)

```js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: 'var(--color-primary)',   hover: 'var(--color-primary-hover)',   light: 'var(--color-primary-light)' },
        secondary: { DEFAULT: 'var(--color-secondary)', hover: 'var(--color-secondary-hover)', light: 'var(--color-secondary-light)' },
        accent:    { DEFAULT: 'var(--color-accent)',    hover: 'var(--color-accent-hover)',    light: 'var(--color-accent-light)' },
        success:   { DEFAULT: 'var(--color-success)',   light: 'var(--color-success-light)' },
        warning:   { DEFAULT: 'var(--color-warning)',   light: 'var(--color-warning-light)' },
        danger:    { DEFAULT: 'var(--color-danger)',    light: 'var(--color-danger-light)' },
        info:      { DEFAULT: 'var(--color-info)',      light: 'var(--color-info-light)' },
        orange:    { DEFAULT: 'var(--color-orange)',    light: 'var(--color-orange-light)' },
        violet:    { DEFAULT: 'var(--color-violet)',    light: 'var(--color-violet-light)' },
        text:      { primary: 'var(--color-text-primary)', secondary: 'var(--color-text-secondary)', tertiary: 'var(--color-text-tertiary)' },
        bg:        { DEFAULT: 'var(--color-bg)', secondary: 'var(--color-bg-secondary)', raised: 'var(--color-surface-raised)' },
        border: 'var(--color-border)',
      },
      borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)' },
      fontFamily: { sans: ['var(--font-sans)'], display: ['var(--font-display)', 'var(--font-sans)'] },
    },
  },
  plugins: [],
}
```

### 22.2 Paleta (globals.css `:root`)

```css
:root {
  --color-primary:        #6D99E0;
  --color-primary-hover:  #4A7CC8;
  --color-primary-light:  rgba(109, 153, 224, 0.08);
  --color-secondary:      #34425C;
  --color-secondary-hover:#263247;
  --color-secondary-light:#E8ECF0;
  --color-accent:         #3d8ea5;   /* acción principal (botones "+ Crear nuevo", links activos) */
  --color-accent-hover:   #2f758a;
  --color-accent-light:   #e8f2f5;
  --color-success:        #27500A;   --color-success-light:  #EAF3DE;
  --color-warning:        #854F0B;   --color-warning-light:  #FAEEDA;
  --color-danger:         #791F1F;   --color-danger-light:   #FCEBEB;
  --color-info:           #4B6A9E;   --color-info-light:     #E8EEF5;
  --color-orange:         #C2520B;   --color-orange-light:   #FDF1E6;
  --color-violet:         #5B2A86;   --color-violet-light:   #F1E8F8;
  --color-text-primary:   #1a2333;
  --color-text-secondary: #555555;
  --color-text-tertiary:  #888888;
  --color-bg:             #FFFFFF;
  --color-bg-secondary:   #EFEFEF;
  --color-surface-raised: #f8fafb;
  --color-border:         #BCC0C1;
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

### 22.3 Tipografía

- `font-display` = **Sora** (cargada con `next/font/google` en `layout.tsx`).
- `font-sans` = Inter / system-ui.
- Titulos de sección: `font-display text-2xl font-normal text-text-primary mb-1` + párrafo `text-text-secondary`.
- Labels de formulario: `block text-sm font-medium text-text-secondary mb-1.5`.

### 22.4 Animaciones (`animations.css`)

```css
@keyframes modal-overlay-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes modal-card-in    { from { opacity: 0; margin-top: 12px; } to { opacity: 1; margin-top: 0; } }
@keyframes breathe          { 0%,100% { transform: scale(1); opacity: 0.75; } 50% { transform: scale(1.12); opacity: 1; } }
@keyframes popover-in       { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

@media (prefers-reduced-motion: no-preference) {
  .animate-overlay-in  { animation: modal-overlay-in 0.12s ease-out forwards; }
  .animate-card-in     { animation: modal-card-in    0.15s ease-out forwards; }
  .animate-popover-in  { animation: popover-in       0.12s ease-out forwards; }
}
```

### 22.5 Layout raíz (`app/layout.tsx`)

```tsx
const sora = Sora({ subsets: ['latin'], variable: '--font-display' })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={sora.variable}>
      <body>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
```

---

## 23. Tests — Backend (Vitest)

### 23.1 Dos configs

- `vitest.config.ts` → unit (`include: src/**/*.test.ts`).
- `vitest.integration.config.ts` → integration contra **Postgres real** en `:5435`:

```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    isolate: false,
    fileParallelism: false,
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    setupFiles: ['./tests/setup.ts'],
    globalSetup: ['./tests/global-setup.ts'],
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
})
```

### 23.2 Helpers de test

`tests/helpers/test-config.ts`:

```ts
export const TEST_DATABASE_URL = 'postgresql://kinesio_test:kinesio_test@localhost:5435/kinesiocenter_test'
export const TEST_DATABASE_NAME = 'kinesiocenter_test'
```

`tests/helpers/test-db.ts` — cliente Prisma a la DB de test, assert de seguridad (no
tocar otra DB), `resetDb()` con TRUNCATE y `migrateTestDb()`:

```ts
const TEST_DATABASE_URL = /* ... */
function assertTestDatabase(url: string): void {
  if (!url.includes(TEST_DATABASE_NAME) || !url.includes('localhost:5435')) {
    throw new Error('[test-db] La base de test está mal configurada. Abortando.')
  }
}
const TABLES = ['Usuario', 'Rol', 'Cliente', ..., 'Pago', 'Asistencia', ...]

export async function resetDb(): Promise<void> {
  await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`)
}
```

`tests/helpers/fixtures.ts` — helpers de creación (`createCliente`, `createServicio`,
`createActividad`, `createAdmin`, etc.).

`tests/helpers/services.ts` — container compartido:

```ts
import { Container } from '../../src/infrastructure/di/container'
export const container = new Container()
export function services() {
  return { auth: container.getAuthAppService(), usuario: ..., cliente: ..., pago: ..., reporte: ..., /* ... */ }
}
```

### 23.3 Ejemplo de test de integración (reportes)

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { resetDb, testPrisma } from '../helpers/test-db'
import { createActividad, createServicio, createCliente, createClienteServicio } from '../helpers/fixtures'
import { services } from '../helpers/services'

const dateCol = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`)

describe('Reportes (Postgres real)', () => {
  beforeEach(async () => { await resetDb() })

  it('clasifica corriente, atrasado y adelantado por periodo', async () => {
    const actividadId = await createActividad({ descripcion: 'Kinesiología' })
    const servicioId = await createServicio({ nombre: 'Plan Mensual', precio: 150, actividadId, cantidad: 1 })
    const clienteId = await createCliente({ dni: '12345678', nombre: 'Ana', apellido: 'Lopez', email: 'ana@test.com' })
    const csId = await createClienteServicio({ clienteId, servicioId, fechaAsignacion: '2026-08' })

    await testPrisma.pago.create({ data: { clienteServicioId: csId, monto: 250, metodoPago: 'Efectivo', fecha: dateCol('2026-08-15'), periodo: dateCol('2026-09') } })

    const reporte = await services().reporte.getReportePagos('2026-08')
    expect(reporte.ingresadoAdelantado).toBe(250)
  })
})
```

> Para fechas deterministas se usa `setClockForTests(() => new Date('2026-08-15T15:00:00Z'))`
> y se resetea con `afterEach(resetClock)`.

---

## 24. Tests — E2E (Playwright)

### 24.1 Flujo de datos para e2e (backend)

- `back/scripts/e2e-setup.ts` (`pnpm e2e:setup`): docker DB up → migra (principal + logs)
  → truncate negocio → reconstruye menús/RolMenu de admin → seed admin.
- `back/scripts/e2e-reset.ts` (`pnpm e2e:reset`): truncate ligero de tablas de negocio
  (roles/menús/admin persisten). Lo usa `beforeEach` para **aislar cada browser**.

### 24.2 `front/playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test'

const TEST_DB_URL = 'postgresql://kinesio_test:kinesio_test@localhost:5435/kinesiocenter_test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,                 // seriado: 3 browsers comparten la misma DB/app
  retries: 0,
  reporter: [['list'], ['html', { open: 'always' }]],   // abre el reporte al terminar
  timeout: 60_000,
  use: { baseURL: 'http://localhost:3007', trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
  globalSetup: './e2e/global-setup.ts',
  webServer: [
    {
      command: `PORT=3017 CORS_ORIGINS=http://localhost:3007 DATABASE_URL=${TEST_DB_URL} LOGS_DATABASE_URL=${TEST_DB_URL} LOG_APP=false LOG_REQUESTS=false LOG_PRISMA_QUERIES=false LOG_CONSOLE=true RATE_LIMIT_GLOBAL_MAX=100000 RATE_LIMIT_LOGIN_MAX=100000 LOGIN_MAX_ATTEMPTS=100000 LOGIN_LOCK_MINUTES=0 pnpm --dir ../back dev`,
      url: 'http://localhost:3017/api/health',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'API_URL=http://localhost:3017 npx next dev --port 3007',
      url: 'http://localhost:3007',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
```

Puntos que resolvimos en la práctica:
- **Puertos dedicados** (front 3007 / back 3017) para no pisar un dev en 3000/3001.
- **Rate-limit de login desactivado** (los 3 browsers loguean la misma cuenta admin).
- **`beforeEach` con `e2e:reset`** para que la caja del día no colisione entre browsers.
- **Navegación client-side por el sidebar** (evita el race de `user.roles` en hard-reload).
- **IDs únicos por corrida** (`uid`) para no colisionar datos si no se resetea.
- Assertions por **estado** (modal cerrado / panel oculto) en vez de toasts volátiles.

### 24.3 Spec principal (`front/e2e/main-path.spec.ts`, resumen)

```ts
import { test, expect, Page } from '@playwright/test'
import { execSync } from 'node:child_process'

test.beforeEach(() => { execSync('pnpm --dir ../back e2e:reset', { stdio: 'inherit' }) })

const uid = Date.now().toString().slice(-6)
const dni = String(10000000 + Number(uid))

async function login(page: Page): Promise<void> {
  await page.goto('/')
  await page.locator('#email').fill('admin@kinesiocenter.com')
  await page.locator('#password').fill('admin123')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.waitForURL('**/dashboard')
  await page.waitForTimeout(1000)
  await page.waitForLoadState('networkidle')
}

async function pickOption(page: Page, comboName: string, optionLabel: string): Promise<void> {
  await page.getByRole('combobox', { name: comboName }).click()
  await page.getByRole('option', { name: optionLabel }).click()
}

test('camino principal completo', async ({ page }) => {
  await login(page)
  // 1. actividad → 2. servicio → 3. cliente (mockeando localidades) → 4. asignar
  //    servicio → 5. registrar pago → 6. asistencia → 7. abrir+cerrar caja
  // ... selectores con getByLabel/getByRole/placeholder y afirmaciones por estado
})
```

### 24.4 Comandos de e2e finales (viven en front/ y back/, no en la raíz)

En **front/** (`package.json`):

```json
"test:e2e": "playwright test",
"test:e2e:chromium": "playwright test --project=chromium",
"test:e2e:firefox": "playwright test --project=firefox",
"test:e2e:webkit": "playwright test --project=webkit",
"test:e2e:install": "playwright install chromium firefox webkit"
```

En **back/** (`package.json`):

```json
"e2e:setup": "tsx scripts/e2e-setup.ts",
"e2e:reset": "tsx scripts/e2e-reset.ts"
```

---

## 25. Comandos de desarrollo

### Back (`back/`)

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor dev con hot-reload (`tsx watch --env-file .env`) |
| `pnpm build` | `tsc` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:generate` | Generar cliente Prisma principal |
| `pnpm db:generate:logs` | Generar cliente Prisma de logs |
| `pnpm db:migrate` | Migraciones Prisma (`migrate dev`) |
| `pnpm db:seed` | Seed del admin |
| `pnpm test` | Unit + Integration (levanta docker DB) |
| `pnpm test:unit` | Solo unit |
| `pnpm test:integration` | Docker DB up + vitest integration |
| `pnpm e2e:setup` / `pnpm e2e:reset` | Bootstrap / reset por browser |

### Front (`front/`)

| Comando | Descripción |
|---|---|
| `pnpm dev` | Next dev en `:3000` |
| `pnpm build` / `pnpm start` | Build / producción |
| `pnpm test:e2e` | E2E en 3 browsers (abre reporte HTML al terminar) |
| `pnpm test:e2e:chromium` / `:firefox` / `:webkit` | Un solo browser |
| `pnpm test:e2e:install` | Descargar browsers (primera vez) |
| `pnpm exec playwright show-report` | Reabrir el reporte HTML |

---

## 26. Checklist para el proyecto nuevo

### Backend
- [ ] `back/` con `express`, `tsx`, `prisma`, `valibot`, `winston`, `vitest`.
- [ ] `src/config/index.ts` con todos los env vars y defaults.
- [ ] `shared-kernel/`: `Entity`, `Errors`, `AppContext` (AsyncLocalStorage), `Dates`,
      `Precio`, `Pagination`.
- [ ] `infrastructure/prisma/`: `client.ts` + `schema.prisma` (+ logs si hace falta).
- [ ] `infrastructure/http/`: `app.ts` (pipeline), `routes.ts`, `server.ts` (graceful shutdown).
- [ ] Middlewares en orden: helmet → cors → rate limit → json → cookies → auth → requestLogger → routes → errorHandler.
- [ ] `di/container.ts` manual, un `getXService()` por recurso.
- [ ] `logger/`: Winston + `appLog` + `AsyncBatchTransport`.
- [ ] Por cada recurso: domain (`Entity` + `I*Repository`) → application (`I*AppService`
      + `*AppService` + `*DTO` con mapper) → `infrastructure/repositories/*Repository`
      → `controllers/*Controller` → registrarlo en `routes.ts` y `container.ts`.
- [ ] Validaciones Valibot en `lib/validation.ts` con `pipe()`/`optional()`.
- [ ] Tests integration con `resetDb`, `fixtures` y `services()`.

### Frontend
- [ ] App Router: `page.tsx` (SSR fetch) + `loading.tsx` + `_components/*Manager|*List|*FormModal`.
- [ ] Auth: `LoginPage` + `middleware.ts` + `apiClient` (server/client + refresh) + cookies firmadas.
- [ ] `AppShell` + `UserProvider`/`AuthContext` + `Sidebar`/`SidebarLink` (menus por rol).
- [ ] `useCrud` + `DataTable` + `CrudFormModal` + `InputField`/`Select`/`SearchableSelect`/`DatePicker`/`Toggle`/`AsyncButton`.
- [ ] Server Actions (`actions/`) + `actionResult.ts` + `services/` + `types/` espejo.
- [ ] Design tokens en `tailwind.config.js` + CSS vars + `animations.css` + `Sora`.

### E2E
- [ ] `back/scripts/e2e-setup.ts` + `e2e-reset.ts` + scripts en `back/package.json`.
- [ ] `front/playwright.config.ts` (3 browsers, puertos dedicados, rate-limit off, reporte HTML).
- [ ] `e2e/global-setup.ts` + `e2e/main-path.spec.ts` (camino principal, `beforeEach` reset, uid único).

---

*Fin del blueprint. Todo lo anterior fue leído y verificado sobre el repo KinesioCenter.*