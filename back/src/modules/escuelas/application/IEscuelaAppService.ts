import { CreateEscuelaDTO, UpdateEscuelaDTO, EscuelaResponseDTO } from "./EscuelaDTO"
import { PaginatedResult } from "../../../shared-kernel/Pagination"
import { FindEscuelasParams } from "../domain/IEscuelaRepository"

export interface IEscuelaAppService {
  create(dto: CreateEscuelaDTO): Promise<EscuelaResponseDTO>
  update(id: number, dto: UpdateEscuelaDTO): Promise<EscuelaResponseDTO>
  delete(id: number): Promise<void>
  getById(id: number): Promise<EscuelaResponseDTO>
  list(params: FindEscuelasParams): Promise<PaginatedResult<EscuelaResponseDTO>>
}
