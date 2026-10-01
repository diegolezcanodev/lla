import Transport from 'winston-transport'
import { logsPrisma } from '../prisma/logs/client'
import { config } from '../../config'

interface LogEntry {
  timestamp: string
  level?: string
  message?: string
  category?: 'http' | 'app' | 'prisma'
  method?: string
  url?: string
  status?: number
  durationMs?: number
  userId?: string
  roles?: string
  requestBody?: string
  responseBody?: string
  error?: string
  meta?: string
  query?: string
  params?: string
  queryDurationMs?: number
  target?: string
}

export class AsyncBatchTransport extends Transport {
  private buffer: LogEntry[] = []
  private interval: NodeJS.Timeout | null = null

  constructor() {
    super()
    this.interval = setInterval(() => this.flush(), config.logs.flushIntervalMs)
  }

  log(entry: LogEntry, next: () => void): void {
    if (entry.category === 'prisma' && config.logs.prismaQueries.slowQueryMs > 0) {
      const duration = entry.queryDurationMs ?? 0
      if (duration < config.logs.prismaQueries.slowQueryMs) {
        next()
        return
      }
    }
    this.buffer.push(entry)
    if (this.buffer.length >= config.logs.batchSize) {
      this.flush()
    }
    next()
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return
    const batch = this.buffer.splice(0)

    if (!config.logs.dbUrl) return

    const http = batch.filter((e) => e.category === 'http')
    const app = batch.filter((e) => e.category === 'app')
    const prisma = batch.filter((e) => e.category === 'prisma')
    const uncategorized = batch.filter((e) => !e.category)

    try {
      if (http.length > 0) {
        await logsPrisma.apiLog.createMany({
          data: http.map((e) => ({
            method: e.method ?? '',
            url: e.url ?? '',
            status: e.status ?? 0,
            durationMs: e.durationMs ?? 0,
            userId: e.userId ?? null,
            roles: e.roles ?? null,
            requestBody: e.requestBody ?? null,
            responseBody: e.responseBody ?? null,
            error: e.error ?? null,
          })),
        })
      }
      const allApp = [...app, ...uncategorized]
      if (allApp.length > 0) {
        await logsPrisma.appLog.createMany({
          data: allApp.map((e) => ({
            level: e.level ?? 'info',
            message: e.message ?? '',
            meta: e.meta ?? null,
          })),
        })
      }
      if (prisma.length > 0) {
        await logsPrisma.prismaQueryLog.createMany({
          data: prisma.map((e) => ({
            query: e.query ?? '',
            params: e.params ?? null,
            durationMs: e.queryDurationMs ?? 0,
            target: e.target ?? null,
          })),
        })
      }
    } catch (err) {
      // Don't crash the server if log database is unavailable
      if (process.env.NODE_ENV !== 'test') {
        console.error('[AsyncBatchTransport] flush failed:', err)
      }
    }
  }

  async close(): Promise<void> {
    if (this.interval) clearInterval(this.interval)
    await this.flush()
    try {
      await logsPrisma.$disconnect()
    } catch {
      // ignore
    }
  }
}
