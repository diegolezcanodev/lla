import { CreateReclamoDTO, UpdateReclamoDTO, ReclamoResponseDTO } from "./ReclamoDTO"
import { PaginatedResult } from "../../../shared-kernel/Pagination"
import { FindReclamosParams } from "../domain/IReclamoRepository"

export interface IReclamoAppService {
  create(dto: CreateReclamoDTO): Promise<ReclamoResponseDTO>
  update(id: number, dto: UpdateReclamoDTO): Promise<ReclamoResponseDTO>
  delete(id: number): Promise<void>
  getById(id: number): Promise<ReclamoResponseDTO>
  list(params: FindReclamosParams): Promise<PaginatedResult<ReclamoResponseDTO>>
}
