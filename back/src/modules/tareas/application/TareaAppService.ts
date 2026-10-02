import { ITareaAppService } from "./ITareaAppService"
import { ITareaRepository, FindTareasParams } from "../domain/ITareaRepository"
import { TareaEntity, ComentarioItem } from "../domain/TareaEntity"
import { CreateTareaDTO, UpdateTareaDTO, TareaResponseDTO } from "./TareaDTO"
import { NotFoundError } from "../../../shared-kernel/Errors"
import { PaginatedResult } from "../../../shared-kernel/Pagination"

export class TareaAppService implements ITareaAppService {
  constructor(private readonly tareaRepo: ITareaRepository) {}

  private toDTO(entity: TareaEntity): TareaResponseDTO {
    return {
      id: entity.id,
      titulo: entity.titulo,
      descripcion: entity.descripcion || null,
      estado: entity.estado,
      prioridad: entity.prioridad,
      asignados: entity.asignados || [],
      fechaLimite: entity.fechaLimite ? entity.fechaLimite.toISOString().slice(0, 10) : null,
      barrioId: entity.barrioId || null,
      barrioNombre: entity.barrioNombre || null,
      etiquetas: entity.etiquetas || [],
      observaciones: entity.observaciones || null,
      comentarios: entity.comentarios || [],
      creadoEn: entity.creadoEn.toISOString(),
      actualizadoEn: entity.actualizadoEn.toISOString(),
    }
  }

  async create(dto: CreateTareaDTO): Promise<TareaResponseDTO> {
    const entity = new TareaEntity({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      estado: dto.estado,
      prioridad: dto.prioridad,
      asignadosIds: dto.asignadosIds,
      fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : null,
      barrioId: dto.barrioId,
      etiquetas: dto.etiquetas,
      observaciones: dto.observaciones,
    })
    const saved = await this.tareaRepo.save(entity)
    const full = await this.tareaRepo.findById(saved.id)
    return this.toDTO(full || saved)
  }

  async update(id: number, dto: UpdateTareaDTO): Promise<TareaResponseDTO> {
    const existing = await this.tareaRepo.findById(id)
    if (!existing) throw new NotFoundError("Tarea", id)
    
    const updateData: any = { ...dto }
    if (dto.fechaLimite !== undefined) {
      updateData.fechaLimite = dto.fechaLimite ? new Date(dto.fechaLimite) : null
    }
    existing.updateInfo(updateData)
    await this.tareaRepo.save(existing)
    const updated = await this.tareaRepo.findById(id)
    return this.toDTO(updated || existing)
  }

  async delete(id: number): Promise<void> {
    const existing = await this.tareaRepo.findById(id)
    if (!existing) throw new NotFoundError("Tarea", id)
    await this.tareaRepo.delete(id)
  }

  async getById(id: number): Promise<TareaResponseDTO> {
    const entity = await this.tareaRepo.findById(id)
    if (!entity) throw new NotFoundError("Tarea", id)
    return this.toDTO(entity)
  }

  async list(params: FindTareasParams): Promise<PaginatedResult<TareaResponseDTO>> {
    const result = await this.tareaRepo.findAll(params)
    return {
      ...result,
      data: result.data.map((t) => this.toDTO(t)),
    }
  }

  async addComentario(tareaId: number, autor: string, mensaje: string, usuarioId?: number): Promise<ComentarioItem> {
    const existing = await this.tareaRepo.findById(tareaId)
    if (!existing) throw new NotFoundError("Tarea", tareaId)
    return this.tareaRepo.addComentario(tareaId, autor, mensaje, usuarioId)
  }
}
