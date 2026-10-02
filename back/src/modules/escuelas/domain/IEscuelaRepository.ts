import { EscuelaEntity } from "./EscuelaEntity"
import { PaginationInput, PaginatedResult } from "../../../shared-kernel/Pagination"

export interface FindEscuelasParams extends PaginationInput {
  search?: string
  barrioId?: number
  nivel?: string
  activa?: boolean
}

export interface IEscuelaRepository {
  findById(id: number): Promise<EscuelaEntity | null>
  findAll(params: FindEscuelasParams): Promise<PaginatedResult<EscuelaEntity>>
  save(entity: EscuelaEntity): Promise<EscuelaEntity>
  delete(id: number): Promise<void>
}
