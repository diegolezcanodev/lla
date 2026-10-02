import {
  CreateMiembroEquipoDTO,
  UpdateMiembroEquipoDTO,
  MiembroEquipoResponseDTO,
} from './MiembroEquipoDTO'
import { PaginatedResult } from '../../../shared-kernel/Pagination'
import { FindEquipoParams } from '../domain/IMiembroEquipoRepository'

export interface IMiembroEquipoAppService {
  create(dto: CreateMiembroEquipoDTO): Promise<MiembroEquipoResponseDTO>
  update(id: number, dto: UpdateMiembroEquipoDTO): Promise<MiembroEquipoResponseDTO>
  delete(id: number): Promise<void>
  getById(id: number): Promise<MiembroEquipoResponseDTO>
  list(params: FindEquipoParams): Promise<PaginatedResult<MiembroEquipoResponseDTO>>
}
