import { ConflictError, AlreadyExistsError, NotFoundError } from '../../../shared-kernel/Errors'
import { PaginatedResult } from '../../../shared-kernel/Pagination'
import { IBarrioRepository, FindBarriosParams } from '../domain/IBarrioRepository'
import { BarrioEntity } from '../domain/BarrioEntity'
import { IBarrioAppService } from './IBarrioAppService'
import { CreateBarrioDTO, UpdateBarrioDTO, BarrioResponseDTO } from './BarrioDTO'

function toResponseDTO(entity: BarrioEntity): BarrioResponseDTO {
  return {
    id: entity.id,
    nombre: entity.nombre,
    codigo: entity.codigo ?? null,
    color: entity.color ?? null,
    prioridad: entity.prioridad,
    descripcion: entity.descripcion ?? null,
    observaciones: entity.observaciones ?? null,
    tags: entity.tags,
    activo: entity.activo,
    creadoEn: entity.creadoEn.toISOString(),
    actualizadoEn: entity.actualizadoEn.toISOString(),
  }
}

export class BarrioAppService implements IBarrioAppService {
  constructor(private readonly repository: IBarrioRepository) {}

  async create(dto: CreateBarrioDTO): Promise<BarrioResponseDTO> {
    const nombre = dto.nombre.trim()
    if (!nombre) {
      throw new ConflictError('El nombre del barrio es requerido')
    }

    const existing = await this.repository.findByNombre(nombre)
    if (existing) {
      throw new AlreadyExistsError('Barrio', nombre, 'nombre')
    }

    const codigo = dto.codigo?.trim().toUpperCase().slice(0, 10) || null
    const color = dto.color?.trim() || null
    const prioridad = dto.prioridad || 'MEDIA'
    const descripcion = dto.descripcion?.trim() || null
    const observaciones = dto.observaciones?.trim() || null
    const tags = Array.isArray(dto.tags) ? dto.tags.map((t) => t.trim()).filter(Boolean) : []

    const entity = new BarrioEntity({
      nombre,
      codigo,
      color,
      prioridad,
      descripcion,
      observaciones,
      tags,
    })

    const saved = await this.repository.save(entity)
    return toResponseDTO(saved)
  }

  async update(id: number, dto: UpdateBarrioDTO): Promise<BarrioResponseDTO> {
    const barrio = await this.repository.findById(id)
    if (!barrio) {
      throw new NotFoundError('Barrio', id)
    }

    if (dto.nombre !== undefined) {
      const trimmed = dto.nombre.trim()
      if (!trimmed) throw new ConflictError('El nombre del barrio no puede estar vacío')
      if (trimmed.toLowerCase() !== barrio.nombre.toLowerCase()) {
        const existing = await this.repository.findByNombre(trimmed)
        if (existing && existing.id !== id) {
          throw new AlreadyExistsError('Barrio', trimmed, 'nombre')
        }
      }
      barrio.updateInfo({ nombre: trimmed })
    }

    if (dto.codigo !== undefined) {
      barrio.updateInfo({ codigo: dto.codigo ? dto.codigo.trim().toUpperCase().slice(0, 10) : null })
    }

    if (dto.color !== undefined) {
      barrio.updateInfo({ color: dto.color ? dto.color.trim() : null })
    }

    if (dto.prioridad !== undefined) {
      barrio.updateInfo({ prioridad: dto.prioridad })
    }

    if (dto.descripcion !== undefined) {
      barrio.updateInfo({ descripcion: dto.descripcion ? dto.descripcion.trim() : null })
    }

    if (dto.observaciones !== undefined) {
      barrio.updateInfo({ observaciones: dto.observaciones ? dto.observaciones.trim() : null })
    }

    if (dto.tags !== undefined) {
      barrio.updateInfo({
        tags: Array.isArray(dto.tags) ? dto.tags.map((t) => t.trim()).filter(Boolean) : [],
      })
    }

    if (dto.activo !== undefined) {
      barrio.updateInfo({ activo: dto.activo })
    }

    const saved = await this.repository.save(barrio)
    return toResponseDTO(saved)
  }

  async delete(id: number): Promise<void> {
    const barrio = await this.repository.findById(id)
    if (!barrio) {
      throw new NotFoundError('Barrio', id)
    }
    await this.repository.delete(id)
  }

  async getById(id: number): Promise<BarrioResponseDTO> {
    const barrio = await this.repository.findById(id)
    if (!barrio) {
      throw new NotFoundError('Barrio', id)
    }
    return toResponseDTO(barrio)
  }

  async list(params: FindBarriosParams): Promise<PaginatedResult<BarrioResponseDTO>> {
    const result = await this.repository.findAll(params)
    return {
      ...result,
      data: result.data.map(toResponseDTO),
    }
  }

  async listAllActivos(): Promise<BarrioResponseDTO[]> {
    const list = await this.repository.listAllActivos()
    return list.map(toResponseDTO)
  }
}
