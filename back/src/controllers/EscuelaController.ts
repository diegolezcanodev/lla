import { Router, Request, Response } from "express"
import { safeParse, flatten, InferOutput } from "valibot"
import { IEscuelaAppService } from "../modules/escuelas/application/IEscuelaAppService"
import { ok, sendValidationError, sendBadRequest, sendError, parseId } from "./helpers"
import { createEscuelaSchema, updateEscuelaSchema } from "../lib/validation"

function validateCreate(req: Request, res: Response): InferOutput<typeof createEscuelaSchema> | void {
  const parsed = safeParse(createEscuelaSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function validateUpdate(req: Request, res: Response): InferOutput<typeof updateEscuelaSchema> | void {
  const parsed = safeParse(updateEscuelaSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

class EscuelaController {
  constructor(private readonly appService: IEscuelaAppService) {}

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
    const nivel = req.query.nivel as string | undefined
    const activa = req.query.activa !== undefined ? req.query.activa === "true" : undefined

    ok(res, this.appService.list({ page, limit, search, barrioId, nivel, activa }))
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

export function createEscuelaRouter(appService: IEscuelaAppService): Router {
  const ctrl = new EscuelaController(appService)
  const router = Router()

  router.post("/", ctrl.create)
  router.get("/", ctrl.list)
  router.get("/:id", ctrl.getById)
  router.patch("/:id", ctrl.update)
  router.delete("/:id", ctrl.delete)

  return router
}
