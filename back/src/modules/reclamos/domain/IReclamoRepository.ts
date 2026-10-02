import { ReclamoEntity } from "./ReclamoEntity"
import { PaginationInput, PaginatedResult } from "../../../shared-kernel/Pagination"

export interface FindReclamosParams extends PaginationInput {
  search?: string
  barrioId?: number
  categoria?: string
  estado?: string
  prioridad?: string
  asignadoAId?: number
}

export interface IReclamoRepository {
  findById(id: number): Promise<ReclamoEntity | null>
  findAll(params: FindReclamosParams): Promise<PaginatedResult<ReclamoEntity>>
  save(entity: ReclamoEntity): Promise<ReclamoEntity>
  delete(id: number): Promise<void>
}
