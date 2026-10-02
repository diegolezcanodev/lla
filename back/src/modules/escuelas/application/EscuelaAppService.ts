import { IEscuelaAppService } from "./IEscuelaAppService"
import { IEscuelaRepository, FindEscuelasParams } from "../domain/IEscuelaRepository"
import { EscuelaEntity } from "../domain/EscuelaEntity"
import { CreateEscuelaDTO, UpdateEscuelaDTO, EscuelaResponseDTO } from "./EscuelaDTO"
import { NotFoundError } from "../../../shared-kernel/Errors"
import { PaginatedResult } from "../../../shared-kernel/Pagination"

export class EscuelaAppService implements IEscuelaAppService {
  constructor(private readonly escuelaRepo: IEscuelaRepository) {}

  private toDTO(entity: EscuelaEntity): EscuelaResponseDTO {
    return {
      id: entity.id,
      nombre: entity.nombre,
      nivel: entity.nivel,
      numero: entity.numero || null,
      modalidad: entity.modalidad || null,
      direccion: entity.direccion || null,
      barrioId: entity.barrioId || null,
      barrioNombre: entity.barrioNombre || null,
      director: entity.director || null,
      telefonoDirector: entity.telefonoDirector || null,
      emailDirector: entity.emailDirector || null,
      observaciones: entity.observaciones || null,
      activa: entity.activa,
      creadoEn: entity.creadoEn.toISOString(),
      actualizadoEn: entity.actualizadoEn.toISOString(),
    }
  }

  async create(dto: CreateEscuelaDTO): Promise<EscuelaResponseDTO> {
    const entity = new EscuelaEntity({
      nombre: dto.nombre,
      nivel: dto.nivel,
      numero: dto.numero,
      modalidad: dto.modalidad,
      direccion: dto.direccion,
      barrioId: dto.barrioId,
      director: dto.director,
      telefonoDirector: dto.telefonoDirector,
      emailDirector: dto.emailDirector,
      observaciones: dto.observaciones,
      activa: true,
    })
    const saved = await this.escuelaRepo.save(entity)
    const full = await this.escuelaRepo.findById(saved.id)
    return this.toDTO(full || saved)
  }

  async update(id: number, dto: UpdateEscuelaDTO): Promise<EscuelaResponseDTO> {
    const existing = await this.escuelaRepo.findById(id)
    if (!existing) throw new NotFoundError("Escuela", id)
    existing.updateInfo(dto)
    await this.escuelaRepo.save(existing)
    const updated = await this.escuelaRepo.findById(id)
    return this.toDTO(updated || existing)
  }

  async delete(id: number): Promise<void> {
    const existing = await this.escuelaRepo.findById(id)
    if (!existing) throw new NotFoundError("Escuela", id)
    await this.escuelaRepo.delete(id)
  }

  async getById(id: number): Promise<EscuelaResponseDTO> {
    const entity = await this.escuelaRepo.findById(id)
    if (!entity) throw new NotFoundError("Escuela", id)
    return this.toDTO(entity)
  }

  async list(params: FindEscuelasParams): Promise<PaginatedResult<EscuelaResponseDTO>> {
    const result = await this.escuelaRepo.findAll(params)
    return {
      ...result,
      data: result.data.map((e) => this.toDTO(e)),
    }
  }
}
