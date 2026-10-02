import { IOposicionAppService } from "./IOposicionAppService"
import { IPartidoRepository, ICandidatoRepository, FindPartidosParams, FindCandidatosParams } from "../domain/IOposicionRepository"
import { PartidoEntity } from "../domain/PartidoEntity"
import { CandidatoEntity } from "../domain/CandidatoEntity"
import {
  CreatePartidoDTO,
  UpdatePartidoDTO,
  PartidoResponseDTO,
  CreateCandidatoDTO,
  UpdateCandidatoDTO,
  CandidatoResponseDTO,
} from "./OposicionDTO"
import { NotFoundError } from "../../../shared-kernel/Errors"
import { PaginatedResult } from "../../../shared-kernel/Pagination"

export class OposicionAppService implements IOposicionAppService {
  constructor(
    private readonly partidoRepo: IPartidoRepository,
    private readonly candidatoRepo: ICandidatoRepository,
  ) {}

  private toPartidoDTO(entity: PartidoEntity): PartidoResponseDTO {
    return {
      id: entity.id,
      nombre: entity.nombre,
      sigla: entity.sigla || null,
      color: entity.color || null,
      referenteNombre: entity.referenteNombre || null,
      observaciones: entity.observaciones || null,
      activo: entity.activo,
      candidatosCount: entity.candidatosCount || 0,
      creadoEn: entity.creadoEn.toISOString(),
      actualizadoEn: entity.actualizadoEn.toISOString(),
    }
  }

  private toCandidatoDTO(entity: CandidatoEntity): CandidatoResponseDTO {
    return {
      id: entity.id,
      nombre: entity.nombre,
      apellido: entity.apellido,
      partidoId: entity.partidoId || null,
      partidoNombre: entity.partidoNombre || null,
      partidoColor: entity.partidoColor || null,
      cargo: entity.cargo || null,
      telefono: entity.telefono || null,
      email: entity.email || null,
      instagram: entity.instagram || null,
      fortalezas: entity.fortalezas || null,
      debilidades: entity.debilidades || null,
      infoEstrategica: entity.infoEstrategica || null,
      nivelAmenaza: entity.nivelAmenaza,
      observaciones: entity.observaciones || null,
      activo: entity.activo,
      creadoEn: entity.creadoEn.toISOString(),
      actualizadoEn: entity.actualizadoEn.toISOString(),
    }
  }

  // Partidos
  async createPartido(dto: CreatePartidoDTO): Promise<PartidoResponseDTO> {
    const entity = new PartidoEntity({ ...dto, activo: true })
    const saved = await this.partidoRepo.save(entity)
    return this.toPartidoDTO(saved)
  }

  async updatePartido(id: number, dto: UpdatePartidoDTO): Promise<PartidoResponseDTO> {
    const existing = await this.partidoRepo.findById(id)
    if (!existing) throw new NotFoundError("Partido", id)
    existing.updateInfo(dto)
    await this.partidoRepo.save(existing)
    const updated = await this.partidoRepo.findById(id)
    return this.toPartidoDTO(updated || existing)
  }

  async deletePartido(id: number): Promise<void> {
    const existing = await this.partidoRepo.findById(id)
    if (!existing) throw new NotFoundError("Partido", id)
    await this.partidoRepo.delete(id)
  }

  async getPartidoById(id: number): Promise<PartidoResponseDTO> {
    const entity = await this.partidoRepo.findById(id)
    if (!entity) throw new NotFoundError("Partido", id)
    return this.toPartidoDTO(entity)
  }

  async listPartidos(params: FindPartidosParams): Promise<PaginatedResult<PartidoResponseDTO>> {
    const result = await this.partidoRepo.findAll(params)
    return {
      ...result,
      data: result.data.map((p) => this.toPartidoDTO(p)),
    }
  }

  async listAllPartidosActivos(): Promise<PartidoResponseDTO[]> {
    const list = await this.partidoRepo.listAllActivos()
    return list.map((p) => this.toPartidoDTO(p))
  }

  // Candidatos
  async createCandidato(dto: CreateCandidatoDTO): Promise<CandidatoResponseDTO> {
    const entity = new CandidatoEntity({ ...dto, activo: true })
    const saved = await this.candidatoRepo.save(entity)
    const full = await this.candidatoRepo.findById(saved.id)
    return this.toCandidatoDTO(full || saved)
  }

  async updateCandidato(id: number, dto: UpdateCandidatoDTO): Promise<CandidatoResponseDTO> {
    const existing = await this.candidatoRepo.findById(id)
    if (!existing) throw new NotFoundError("Candidato", id)
    existing.updateInfo(dto)
    await this.candidatoRepo.save(existing)
    const updated = await this.candidatoRepo.findById(id)
    return this.toCandidatoDTO(updated || existing)
  }

  async deleteCandidato(id: number): Promise<void> {
    const existing = await this.candidatoRepo.findById(id)
    if (!existing) throw new NotFoundError("Candidato", id)
    await this.candidatoRepo.delete(id)
  }

  async getCandidatoById(id: number): Promise<CandidatoResponseDTO> {
    const entity = await this.candidatoRepo.findById(id)
    if (!entity) throw new NotFoundError("Candidato", id)
    return this.toCandidatoDTO(entity)
  }

  async listCandidatos(params: FindCandidatosParams): Promise<PaginatedResult<CandidatoResponseDTO>> {
    const result = await this.candidatoRepo.findAll(params)
    return {
      ...result,
      data: result.data.map((c) => this.toCandidatoDTO(c)),
    }
  }
}
