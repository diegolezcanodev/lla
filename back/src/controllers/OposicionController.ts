import { Router, Request, Response } from "express"
import { safeParse, flatten, InferOutput } from "valibot"
import { IOposicionAppService } from "../modules/oposicion/application/IOposicionAppService"
import { ok, sendValidationError, sendBadRequest, sendError, parseId } from "./helpers"
import {
  createPartidoSchema,
  updatePartidoSchema,
  createCandidatoSchema,
  updateCandidatoSchema,
} from "../lib/validation"

function validateCreatePartido(req: Request, res: Response): InferOutput<typeof createPartidoSchema> | void {
  const parsed = safeParse(createPartidoSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function validateUpdatePartido(req: Request, res: Response): InferOutput<typeof updatePartidoSchema> | void {
  const parsed = safeParse(updatePartidoSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function validateCreateCandidato(req: Request, res: Response): InferOutput<typeof createCandidatoSchema> | void {
  const parsed = safeParse(createCandidatoSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function validateUpdateCandidato(req: Request, res: Response): InferOutput<typeof updateCandidatoSchema> | void {
  const parsed = safeParse(updateCandidatoSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

class OposicionController {
  constructor(private readonly appService: IOposicionAppService) {}

  // PARTIDOS
  createPartido = async (req: Request, res: Response): Promise<void> => {
    const data = validateCreatePartido(req, res)
    if (!data) return
    ok(res, this.appService.createPartido(data as any), 201)
  }

  listPartidos = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 12))
    const search = req.query.search as string | undefined
    const activo = req.query.activo !== undefined ? req.query.activo === "true" : undefined

    ok(res, this.appService.listPartidos({ page, limit, search, activo }))
  }

  listAllPartidosActivos = async (_req: Request, res: Response): Promise<void> => {
    ok(res, this.appService.listAllPartidosActivos())
  }

  getPartidoById = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, "ID inválido")
    ok(res, this.appService.getPartidoById(id))
  }

  updatePartido = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, "ID inválido")
    const data = validateUpdatePartido(req, res)
    if (!data) return
    ok(res, this.appService.updatePartido(id, data as any))
  }

  deletePartido = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, "ID inválido")
    try {
      await this.appService.deletePartido(id)
      res.status(204).send()
    } catch (err) {
      sendError(res, err)
    }
  }

  // CANDIDATOS
  createCandidato = async (req: Request, res: Response): Promise<void> => {
    const data = validateCreateCandidato(req, res)
    if (!data) return
    ok(res, this.appService.createCandidato(data as any), 201)
  }

  listCandidatos = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 12))
    const search = req.query.search as string | undefined
    const partidoId = req.query.partidoId ? parseInt(req.query.partidoId as string) : undefined
    const nivelAmenaza = req.query.nivelAmenaza as string | undefined
    const activo = req.query.activo !== undefined ? req.query.activo === "true" : undefined

    ok(res, this.appService.listCandidatos({ page, limit, search, partidoId, nivelAmenaza, activo }))
  }

  getCandidatoById = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, "ID inválido")
    ok(res, this.appService.getCandidatoById(id))
  }

  updateCandidato = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, "ID inválido")
    const data = validateUpdateCandidato(req, res)
    if (!data) return
    ok(res, this.appService.updateCandidato(id, data as any))
  }

  deleteCandidato = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req)
    if (!id) return sendBadRequest(res, "ID inválido")
    try {
      await this.appService.deleteCandidato(id)
      res.status(204).send()
    } catch (err) {
      sendError(res, err)
    }
  }
}

export function createOposicionRouter(appService: IOposicionAppService): {
  partidosRouter: Router
  candidatosRouter: Router
} {
  const ctrl = new OposicionController(appService)

  const partidosRouter = Router()
  partidosRouter.post("/", ctrl.createPartido)
  partidosRouter.get("/", ctrl.listPartidos)
  partidosRouter.get("/activos", ctrl.listAllPartidosActivos)
  partidosRouter.get("/:id", ctrl.getPartidoById)
  partidosRouter.patch("/:id", ctrl.updatePartido)
  partidosRouter.delete("/:id", ctrl.deletePartido)

  const candidatosRouter = Router()
  candidatosRouter.post("/", ctrl.createCandidato)
  candidatosRouter.get("/", ctrl.listCandidatos)
  candidatosRouter.get("/:id", ctrl.getCandidatoById)
  candidatosRouter.patch("/:id", ctrl.updateCandidato)
  candidatosRouter.delete("/:id", ctrl.deleteCandidato)

  return { partidosRouter, candidatosRouter }
}
