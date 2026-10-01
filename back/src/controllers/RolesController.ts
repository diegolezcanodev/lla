import { Router, Request, Response } from 'express'
import { authorize } from '../infrastructure/middleware/auth'
import { IRolesAppService } from '../modules/roles/application/RolesDTO'
import { ok } from './helpers'

class RolesController {
  constructor(private readonly appService: IRolesAppService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    ok(res, this.appService.list())
  }
}

export function createRolesRouter(appService: IRolesAppService): Router {
  const ctrl = new RolesController(appService)
  const router = Router()

  router.get('/', authorize('Administrador'), ctrl.list)

  return router
}
