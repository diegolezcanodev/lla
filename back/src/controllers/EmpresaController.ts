import { Router, Request, Response } from "express"
import { safeParse, flatten, InferOutput } from "valibot"
import { IEmpresaAppService } from "../modules/empresas/application/IEmpresaAppService"
import { ok, sendValidationError, sendBadRequest, sendError, parseId } from "./helpers"
import { createEmpresaSchema, updateEmpresaSchema } from "../lib/validation"

function validateCreate(req: Request, res: Response): InferOutput<typeof createEmpresaSchema> | void {
  const parsed = safeParse(createEmpresaSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function validateUpdate(req: Request, res: Response): InferOutput<typeof updateEmpresaSchema> | void {
  const parsed = safeParse(updateEmpresaSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

class EmpresaController {
  constructor(private readonly appService: IEmpresaAppService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = validateCreate(req, res)
    if (!data) return
    ok(res, this.appService.create(data as any), 201)
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 12))
    const search = req.query.search as string | undefined
    const barrioId = req.query.barrioId ? parseInt(req.query.barrioId as string) : undefined
    const tamano = req.query.tamano as string | undefined
    const activa = req.query.activa !== undefined ? req.query.activa === "true" : undefined

    ok(res, this.appService.list({ page, limit, search, barrioId, tamano, activa }))
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, "ID inválido")
    ok(res, this.appService.getById(id))
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, "ID inválido")
    const data = validateUpdate(req, res)
    if (!data) return
    ok(res, this.appService.update(id, data as any))
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, "ID inválido")
    try {
      await this.appService.delete(id)
      res.status(204).send()
    } catch (err) {
      sendError(res, err)
    }
  }
}

export function createEmpresaRouter(appService: IEmpresaAppService): Router {
  const ctrl = new EmpresaController(appService)
  const router = Router()

  router.post("/", ctrl.create)
  router.get("/", ctrl.list)
  router.get("/:id", ctrl.getById)
  router.patch("/:id", ctrl.update)
  router.delete("/:id", ctrl.delete)

  return router
}
