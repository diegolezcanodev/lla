import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import {
  NotFoundError,
  AlreadyExistsError,
  UnauthorizedError,
  ConflictError,
  ValidationError,
  StorageFileNotFoundError,
} from '../shared-kernel/Errors'
import { appLog } from '../infrastructure/logger/logger'

export function sendError(res: Response, err: unknown): void {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message })
  } else if (err instanceof StorageFileNotFoundError) {
    res.status(404).json({ error: err.message, code: err.code })
  } else if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message, details: err.details })
  } else if (err instanceof AlreadyExistsError) {
    const details = err.field ? { nested: { [err.field]: [err.message] } } : undefined
    res.status(409).json({ error: err.message, details })
  } else if (err instanceof ConflictError) {
    const body: { error: string; code?: string; details?: any } = { error: err.message }
    if (err.code) body.code = err.code
    if (err.details) body.details = err.details
    res.status(409).json(body)
  } else if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message })
  } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({ error: 'Ya existe un registro con esos datos únicos' })
  } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    res.status(404).json({ error: 'El registro solicitado no existe' })
  } else {
    const realErr = err as Error
    appLog.error(realErr.message, { error: realErr.stack })
    res.locals.apiError = realErr.message
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
    const data = await promise
    res.status(status).json(data)
  } catch (err) {
    sendError(res, err)
  }
}

export function parseId(req: Request): number | null {
  const id = Number(req.params.id)
  return isNaN(id) ? null : id
}
