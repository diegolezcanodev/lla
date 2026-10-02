import {
  CreatePartidoDTO,
  UpdatePartidoDTO,
  PartidoResponseDTO,
  CreateCandidatoDTO,
  UpdateCandidatoDTO,
  CandidatoResponseDTO,
} from "./OposicionDTO"
import { PaginatedResult } from "../../../shared-kernel/Pagination"
import { FindPartidosParams, FindCandidatosParams } from "../domain/IOposicionRepository"

export interface IOposicionAppService {
  // Partidos
  createPartido(dto: CreatePartidoDTO): Promise<PartidoResponseDTO>
  updatePartido(id: number, dto: UpdatePartidoDTO): Promise<PartidoResponseDTO>
  deletePartido(id: number): Promise<void>
  getPartidoById(id: number): Promise<PartidoResponseDTO>
  listPartidos(params: FindPartidosParams): Promise<PaginatedResult<PartidoResponseDTO>>
  listAllPartidosActivos(): Promise<PartidoResponseDTO[]>

  // Candidatos
  createCandidato(dto: CreateCandidatoDTO): Promise<CandidatoResponseDTO>
  updateCandidato(id: number, dto: UpdateCandidatoDTO): Promise<CandidatoResponseDTO>
  deleteCandidato(id: number): Promise<void>
  getCandidatoById(id: number): Promise<CandidatoResponseDTO>
  listCandidatos(params: FindCandidatosParams): Promise<PaginatedResult<CandidatoResponseDTO>>
}
