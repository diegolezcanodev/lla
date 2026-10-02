import { EmpresaEntity } from "./EmpresaEntity"
import { PaginationInput, PaginatedResult } from "../../../shared-kernel/Pagination"

export interface FindEmpresasParams extends PaginationInput {
  search?: string
  barrioId?: number
  tamano?: string
  activa?: boolean
}

export interface IEmpresaRepository {
  findById(id: number): Promise<EmpresaEntity | null>
  findAll(params: FindEmpresasParams): Promise<PaginatedResult<EmpresaEntity>>
  save(entity: EmpresaEntity): Promise<EmpresaEntity>
  delete(id: number): Promise<void>
}
