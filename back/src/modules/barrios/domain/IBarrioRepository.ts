import { BarrioEntity, PrioridadBarrio } from './BarrioEntity'
import { PaginationInput, PaginatedResult } from '../../../shared-kernel/Pagination'

export interface FindBarriosParams extends PaginationInput {
  search?: string
  prioridad?: PrioridadBarrio
  activo?: boolean
}

export interface IBarrioRepository {
  findById(id: number): Promise<BarrioEntity | null>
  findByNombre(nombre: string): Promise<BarrioEntity | null>
  findAll(params: FindBarriosParams): Promise<PaginatedResult<BarrioEntity>>
  listAllActivos(): Promise<BarrioEntity[]>
  save(entity: BarrioEntity): Promise<BarrioEntity>
  delete(id: number): Promise<void>
}
