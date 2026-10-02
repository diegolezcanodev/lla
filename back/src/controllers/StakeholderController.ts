import { Router, Request, Response } from "express"
import { safeParse, flatten, InferOutput } from "valibot"
import { IStakeholderAppService } from "../modules/stakeholders/application/IStakeholderAppService"
import { ok, sendValidationError, sendBadRequest, sendError, parseId } from "./helpers"
import { createStakeholderSchema, updateStakeholderSchema } from "../lib/validation"

function validateCreate(req: Request, res: Response): InferOutput<typeof createStakeholderSchema> | void {
  const parsed = safeParse(createStakeholderSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function validateUpdate(req: Request, res: Response): InferOutput<typeof updateStakeholderSchema> | void {
  const parsed = safeParse(updateStakeholderSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

class StakeholderController {
  constructor(private readonly appService: IStakeholderAppService) {}

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
    const esAliado = req.query.esAliado !== undefined ? req.query.esAliado === "true" : undefined
    const activo = req.query.activo !== undefined ? req.query.activo === "true" : undefined

    ok(res, this.appService.list({ page, limit, search, barrioId, esAliado, activo }))
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

  registrarContacto = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, "ID inválido")
    const fecha = req.body?.fecha as string | undefined
    ok(res, this.appService.registrarContacto(id, fecha))
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

export function createStakeholderRouter(appService: IStakeholderAppService): Router {
  const ctrl = new StakeholderController(appService)
  const router = Router()

  router.post("/", ctrl.create)
  router.get("/", ctrl.list)
  router.post("/:id/contacto", ctrl.registrarContacto)
  router.get("/:id", ctrl.getById)
  router.patch("/:id", ctrl.update)
  router.delete("/:id", ctrl.delete)

  return router
}
