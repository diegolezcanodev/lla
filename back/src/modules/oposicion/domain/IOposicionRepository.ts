import { PartidoEntity } from "./PartidoEntity"
import { CandidatoEntity } from "./CandidatoEntity"
import { PaginationInput, PaginatedResult } from "../../../shared-kernel/Pagination"

export interface FindPartidosParams extends PaginationInput {
  search?: string
  activo?: boolean
}

export interface FindCandidatosParams extends PaginationInput {
  search?: string
  partidoId?: number
  nivelAmenaza?: string
  activo?: boolean
}

export interface IPartidoRepository {
  findById(id: number): Promise<PartidoEntity | null>
  findAll(params: FindPartidosParams): Promise<PaginatedResult<PartidoEntity>>
  listAllActivos(): Promise<PartidoEntity[]>
  save(entity: PartidoEntity): Promise<PartidoEntity>
  delete(id: number): Promise<void>
}

export interface ICandidatoRepository {
  findById(id: number): Promise<CandidatoEntity | null>
  findAll(params: FindCandidatosParams): Promise<PaginatedResult<CandidatoEntity>>
  save(entity: CandidatoEntity): Promise<CandidatoEntity>
  delete(id: number): Promise<void>
}
