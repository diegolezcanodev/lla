import { CreateBarrioDTO, UpdateBarrioDTO, BarrioResponseDTO } from './BarrioDTO'
import { PaginatedResult } from '../../../shared-kernel/Pagination'
import { FindBarriosParams } from '../domain/IBarrioRepository'

export interface IBarrioAppService {
  create(dto: CreateBarrioDTO): Promise<BarrioResponseDTO>
  update(id: number, dto: UpdateBarrioDTO): Promise<BarrioResponseDTO>
  delete(id: number): Promise<void>
  getById(id: number): Promise<BarrioResponseDTO>
  list(params: FindBarriosParams): Promise<PaginatedResult<BarrioResponseDTO>>
  listAllActivos(): Promise<BarrioResponseDTO[]>
}
