import { Router, Request, Response } from "express"
import { safeParse, flatten, InferOutput } from "valibot"
import { IReclamoAppService } from "../modules/reclamos/application/IReclamoAppService"
import { ok, sendValidationError, sendBadRequest, sendError, parseId } from "./helpers"
import { createReclamoSchema, updateReclamoSchema } from "../lib/validation"

function validateCreate(req: Request, res: Response): InferOutput<typeof createReclamoSchema> | void {
  const parsed = safeParse(createReclamoSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function validateUpdate(req: Request, res: Response): InferOutput<typeof updateReclamoSchema> | void {
  const parsed = safeParse(updateReclamoSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

class ReclamoController {
  constructor(private readonly appService: IReclamoAppService) {}

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
    const categoria = req.query.categoria as string | undefined
    const estado = req.query.estado as string | undefined
    const prioridad = req.query.prioridad as string | undefined
    const asignadoAId = req.query.asignadoAId ? parseInt(req.query.asignadoAId as string) : undefined

    ok(res, this.appService.list({ page, limit, search, barrioId, categoria, estado, prioridad, asignadoAId }))
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

export function createReclamoRouter(appService: IReclamoAppService): Router {
  const ctrl = new ReclamoController(appService)
  const router = Router()

  router.post("/", ctrl.create)
  router.get("/", ctrl.list)
  router.get("/:id", ctrl.getById)
  router.patch("/:id", ctrl.update)
  router.delete("/:id", ctrl.delete)

  return router
}
