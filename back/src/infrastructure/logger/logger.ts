import winston from 'winston'
import { AsyncBatchTransport } from './AsyncBatchTransport'
import { config } from '../../config'

const asyncBatch = new AsyncBatchTransport()

export const winstonLogger = winston.createLogger({
  level: config.logs.level,
  format: winston.format.combine(winston.format.timestamp()),
  transports: [
    ...(process.env.LOG_CONSOLE !== 'false'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, ...meta }) => {
                return `${timestamp} [${level}]: ${message} ${
                  Object.keys(meta).length ? JSON.stringify(meta) : ''
                }`
              }),
            ),
          }),
        ]
      : []),
    asyncBatch,
  ],
})

function withTrace(meta?: object): { category: string; meta: string } {
  const trace =
    new Error().stack
      ?.split('\n')
      .slice(3, 6)
      .map((l) => l.trim())
      .join(' | ') ?? ''
  const enriched = { ...((meta as object) ?? {}), trace }
  return { category: 'app', meta: JSON.stringify(enriched) }
}

export const appLog = {
  info: (msg: string, meta?: object) => winstonLogger.info(msg, withTrace(meta)),
  warn: (msg: string, meta?: object) => winstonLogger.warn(msg, withTrace(meta)),
  error: (msg: string, meta?: object) => winstonLogger.error(msg, withTrace(meta)),
  debug: (msg: string, meta?: object) => winstonLogger.debug(msg, withTrace(meta)),
}

export function closeLogger(): Promise<void> {
  return asyncBatch.close()
}
