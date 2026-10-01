import { Router, Request, Response } from 'express'
import { safeParse, flatten, InferOutput } from 'valibot'
import { authorize } from '../infrastructure/middleware/auth'
import { IUsuarioAppService } from '../modules/users/application/IUsuarioAppService'
import { ok, sendValidationError, sendBadRequest, sendError, parseId } from './helpers'
import { createUserSchema, updateUserSchema } from '../lib/validation'

function validateCreate(req: Request, res: Response): InferOutput<typeof createUserSchema> | void {
  const parsed = safeParse(createUserSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function validateUpdate(req: Request, res: Response): InferOutput<typeof updateUserSchema> | void {
  const parsed = safeParse(updateUserSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

class UserController {
  constructor(private readonly appService: IUsuarioAppService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = validateCreate(req, res)
    if (!data) return
    ok(res, this.appService.create(data), 201)
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 12))
    const search = req.query.search as string | undefined
    ok(res, this.appService.list({ page, limit }, search))
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, 'Invalid id')
    ok(res, this.appService.getById(id))
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, 'Invalid id')
    const data = validateUpdate(req, res)
    if (!data) return
    ok(res, this.appService.update(id, data))
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, 'Invalid id')
    try {
      await this.appService.delete(id)
      res.status(204).send()
    } catch (err) {
      sendError(res, err)
    }
  }
}

export function createUserRouter(appService: IUsuarioAppService): Router {
  const ctrl = new UserController(appService)
  const router = Router()

  router.post('/', authorize('Administrador'), ctrl.create)
  router.get('/', authorize('Administrador'), ctrl.list)
  router.get('/:id', authorize('Administrador'), ctrl.getById)
  router.patch('/:id', authorize('Administrador'), ctrl.update)
  router.delete('/:id', authorize('Administrador'), ctrl.delete)

  return router
}
