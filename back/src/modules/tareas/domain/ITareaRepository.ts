import { TareaEntity, ComentarioItem } from "./TareaEntity"
import { PaginationInput, PaginatedResult } from "../../../shared-kernel/Pagination"

export interface FindTareasParams extends PaginationInput {
  search?: string
  estado?: string
  prioridad?: string
  asignadoAId?: number
  barrioId?: number
}

export interface ITareaRepository {
  findById(id: number): Promise<TareaEntity | null>
  findAll(params: FindTareasParams): Promise<PaginatedResult<TareaEntity>>
  save(entity: TareaEntity): Promise<TareaEntity>
  delete(id: number): Promise<void>
  addComentario(tareaId: number, autor: string, mensaje: string, usuarioId?: number): Promise<ComentarioItem>
}
