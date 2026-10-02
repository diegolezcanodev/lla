import { MiembroEquipoEntity } from './MiembroEquipoEntity'
import { PaginationInput, PaginatedResult } from '../../../shared-kernel/Pagination'

export interface FindEquipoParams extends PaginationInput {
  search?: string
  tipo?: string
  barrioId?: number
  activo?: boolean
}

export interface IMiembroEquipoRepository {
  findById(id: number): Promise<MiembroEquipoEntity | null>
  findByDni(dni: string): Promise<MiembroEquipoEntity | null>
  findByUsuarioId(usuarioId: number): Promise<MiembroEquipoEntity | null>
  findAll(params: FindEquipoParams): Promise<PaginatedResult<MiembroEquipoEntity>>
  save(entity: MiembroEquipoEntity): Promise<MiembroEquipoEntity>
  delete(id: number): Promise<void>
}
