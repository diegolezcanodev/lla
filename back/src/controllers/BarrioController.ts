import { Router, Request, Response } from 'express'
import { safeParse, flatten, InferOutput } from 'valibot'
import { authorize } from '../infrastructure/middleware/auth'
import { IBarrioAppService } from '../modules/barrios/application/IBarrioAppService'
import { ok, sendValidationError, sendBadRequest, sendError, parseId } from './helpers'
import { createBarrioSchema, updateBarrioSchema } from '../lib/validation'

function validateCreate(req: Request, res: Response): InferOutput<typeof createBarrioSchema> | void {
  const parsed = safeParse(createBarrioSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function validateUpdate(req: Request, res: Response): InferOutput<typeof updateBarrioSchema> | void {
  const parsed = safeParse(updateBarrioSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

class BarrioController {
  constructor(private readonly appService: IBarrioAppService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = validateCreate(req, res)
    if (!data) return
    ok(res, this.appService.create(data), 201)
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 12))
    const search = req.query.search as string | undefined
    const prioridad = req.query.prioridad as any
    const activo = req.query.activo !== undefined ? req.query.activo === 'true' : undefined

    ok(res, this.appService.list({ page, limit, search, prioridad, activo }))
  }

  listAllActivos = async (_req: Request, res: Response): Promise<void> => {
    ok(res, this.appService.listAllActivos())
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, 'ID inválido')
    ok(res, this.appService.getById(id))
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, 'ID inválido')
    const data = validateUpdate(req, res)
    if (!data) return
    ok(res, this.appService.update(id, data))
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, 'ID inválido')
    try {
      await this.appService.delete(id)
      res.status(204).send()
    } catch (err) {
      sendError(res, err)
    }
  }
}

export function createBarrioRouter(appService: IBarrioAppService): Router {
  const ctrl = new BarrioController(appService)
  const router = Router()

  router.post('/', authorize('Administrador'), ctrl.create)
  router.get('/activos', authorize('Administrador'), ctrl.listAllActivos)
  router.get('/', authorize('Administrador'), ctrl.list)
  router.get('/:id', authorize('Administrador'), ctrl.getById)
  router.patch('/:id', authorize('Administrador'), ctrl.update)
  router.delete('/:id', authorize('Administrador'), ctrl.delete)

  return router
}
