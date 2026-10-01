import { Request, Response, NextFunction } from 'express'
import { appLog } from '../logger/logger'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = (err as { status?: number }).status ?? 500
  const status = Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 500
  const expose = (err as { expose?: boolean }).expose === true

  const body = status === 500
    ? { error: 'Internal server error' }
    : { error: expose ? err.message : 'Bad request' }

  if (status === 500) {
    appLog.error(err.message, { error: err.stack })
  }
  res.status(status).json(body)
}
