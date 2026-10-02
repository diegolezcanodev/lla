import { CreateEmpresaDTO, UpdateEmpresaDTO, EmpresaResponseDTO } from "./EmpresaDTO"
import { PaginatedResult } from "../../../shared-kernel/Pagination"
import { FindEmpresasParams } from "../domain/IEmpresaRepository"

export interface IEmpresaAppService {
  create(dto: CreateEmpresaDTO): Promise<EmpresaResponseDTO>
  update(id: number, dto: UpdateEmpresaDTO): Promise<EmpresaResponseDTO>
  delete(id: number): Promise<void>
  getById(id: number): Promise<EmpresaResponseDTO>
  list(params: FindEmpresasParams): Promise<PaginatedResult<EmpresaResponseDTO>>
}
