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
