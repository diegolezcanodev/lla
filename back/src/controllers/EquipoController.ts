import { Router, Request, Response } from 'express'
import { safeParse, flatten, InferOutput } from 'valibot'
import { authorize } from '../infrastructure/middleware/auth'
import { IMiembroEquipoAppService } from '../modules/equipo/application/IMiembroEquipoAppService'
import { ok, sendValidationError, sendBadRequest, sendError, parseId } from './helpers'
import { createEquipoSchema, updateEquipoSchema } from '../lib/validation'

function validateCreate(req: Request, res: Response): InferOutput<typeof createEquipoSchema> | void {
  const parsed = safeParse(createEquipoSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function validateUpdate(req: Request, res: Response): InferOutput<typeof updateEquipoSchema> | void {
  const parsed = safeParse(updateEquipoSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

class EquipoController {
  constructor(private readonly appService: IMiembroEquipoAppService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = validateCreate(req, res)
    if (!data) return
    ok(res, this.appService.create(data as any), 201)
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 12))
    const search = req.query.search as string | undefined
    const tipo = req.query.tipo as string | undefined
    const barrioId = req.query.barrioId ? parseInt(req.query.barrioId as string) : undefined
    const activo = req.query.activo !== undefined ? req.query.activo === 'true' : undefined

    ok(res, this.appService.list({ page, limit, search, tipo, barrioId, activo }))
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
    ok(res, this.appService.update(id, data as any))
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

export function createEquipoRouter(appService: IMiembroEquipoAppService): Router {
  const ctrl = new EquipoController(appService)
  const router = Router()

  router.post('/', authorize('Administrador'), ctrl.create)
  router.get('/', authorize('Administrador'), ctrl.list)
  router.get('/:id', authorize('Administrador'), ctrl.getById)
  router.patch('/:id', authorize('Administrador'), ctrl.update)
  router.delete('/:id', authorize('Administrador'), ctrl.delete)

  return router
}
