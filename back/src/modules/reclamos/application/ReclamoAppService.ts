import { IReclamoAppService } from "./IReclamoAppService"
import { IReclamoRepository, FindReclamosParams } from "../domain/IReclamoRepository"
import { ReclamoEntity } from "../domain/ReclamoEntity"
import { CreateReclamoDTO, UpdateReclamoDTO, ReclamoResponseDTO } from "./ReclamoDTO"
import { NotFoundError } from "../../../shared-kernel/Errors"
import { PaginatedResult } from "../../../shared-kernel/Pagination"

export class ReclamoAppService implements IReclamoAppService {
  constructor(private readonly reclamoRepo: IReclamoRepository) {}

  private toDTO(entity: ReclamoEntity): ReclamoResponseDTO {
    return {
      id: entity.id,
      vecino: entity.vecino,
      titulo: entity.titulo,
      descripcion: entity.descripcion,
      dni: entity.dni || null,
      telefono: entity.telefono || null,
      barrioId: entity.barrioId || null,
      barrioNombre: entity.barrioNombre || null,
      direccion: entity.direccion || null,
      categoria: entity.categoria,
      estado: entity.estado,
      prioridad: entity.prioridad,
      respuesta: entity.respuesta || null,
      asignadoAId: entity.asignadoAId || null,
      asignadoANombre: entity.asignadoANombre || null,
      observaciones: entity.observaciones || null,
      creadoEn: entity.creadoEn.toISOString(),
      actualizadoEn: entity.actualizadoEn.toISOString(),
    }
  }

  async create(dto: CreateReclamoDTO): Promise<ReclamoResponseDTO> {
    const entity = new ReclamoEntity({
      vecino: dto.vecino,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      dni: dto.dni,
      telefono: dto.telefono,
      barrioId: dto.barrioId,
      direccion: dto.direccion,
      categoria: dto.categoria,
      estado: dto.estado,
      prioridad: dto.prioridad,
      respuesta: dto.respuesta,
      asignadoAId: dto.asignadoAId,
      observaciones: dto.observaciones,
    })
    const saved = await this.reclamoRepo.save(entity)
    const full = await this.reclamoRepo.findById(saved.id)
    return this.toDTO(full || saved)
  }

  async update(id: number, dto: UpdateReclamoDTO): Promise<ReclamoResponseDTO> {
    const existing = await this.reclamoRepo.findById(id)
    if (!existing) throw new NotFoundError("Reclamo", id)
    existing.updateInfo(dto)
    await this.reclamoRepo.save(existing)
    const updated = await this.reclamoRepo.findById(id)
    return this.toDTO(updated || existing)
  }

  async delete(id: number): Promise<void> {
    const existing = await this.reclamoRepo.findById(id)
    if (!existing) throw new NotFoundError("Reclamo", id)
    await this.reclamoRepo.delete(id)
  }

  async getById(id: number): Promise<ReclamoResponseDTO> {
    const entity = await this.reclamoRepo.findById(id)
    if (!entity) throw new NotFoundError("Reclamo", id)
    return this.toDTO(entity)
  }

  async list(params: FindReclamosParams): Promise<PaginatedResult<ReclamoResponseDTO>> {
    const result = await this.reclamoRepo.findAll(params)
    return {
      ...result,
      data: result.data.map((e) => this.toDTO(e)),
    }
  }
}
