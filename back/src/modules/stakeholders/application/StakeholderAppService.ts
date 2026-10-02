import { IStakeholderAppService } from "./IStakeholderAppService"
import { IStakeholderRepository, FindStakeholdersParams } from "../domain/IStakeholderRepository"
import { StakeholderEntity } from "../domain/StakeholderEntity"
import { CreateStakeholderDTO, UpdateStakeholderDTO, StakeholderResponseDTO } from "./StakeholderDTO"
import { NotFoundError } from "../../../shared-kernel/Errors"
import { PaginatedResult } from "../../../shared-kernel/Pagination"

export class StakeholderAppService implements IStakeholderAppService {
  constructor(private readonly stakeholderRepo: IStakeholderRepository) {}

  private toDTO(entity: StakeholderEntity): StakeholderResponseDTO {
    return {
      id: entity.id,
      nombre: entity.nombre,
      apellido: entity.apellido,
      esAliado: entity.esAliado,
      fechaUltimoContacto: entity.fechaUltimoContacto.toISOString().slice(0, 10),
      temperatura: entity.temperatura,
      cargo: entity.cargo || null,
      organizacion: entity.organizacion || null,
      telefono: entity.telefono || null,
      email: entity.email || null,
      instagram: entity.instagram || null,
      barrioId: entity.barrioId || null,
      barrioNombre: entity.barrioNombre || null,
      nivelInfluencia: entity.nivelInfluencia,
      observaciones: entity.observaciones || null,
      activo: entity.activo,
      creadoEn: entity.creadoEn.toISOString(),
      actualizadoEn: entity.actualizadoEn.toISOString(),
    }
  }

  async create(dto: CreateStakeholderDTO): Promise<StakeholderResponseDTO> {
    const entity = new StakeholderEntity({
      nombre: dto.nombre,
      apellido: dto.apellido,
      esAliado: dto.esAliado,
      fechaUltimoContacto: dto.fechaUltimoContacto ? new Date(dto.fechaUltimoContacto) : new Date(),
      cargo: dto.cargo,
      organizacion: dto.organizacion,
      telefono: dto.telefono,
      email: dto.email,
      instagram: dto.instagram,
      barrioId: dto.barrioId,
      nivelInfluencia: dto.nivelInfluencia,
      observaciones: dto.observaciones,
      activo: true,
    })
    const saved = await this.stakeholderRepo.save(entity)
    const full = await this.stakeholderRepo.findById(saved.id)
    return this.toDTO(full || saved)
  }

  async update(id: number, dto: UpdateStakeholderDTO): Promise<StakeholderResponseDTO> {
    const existing = await this.stakeholderRepo.findById(id)
    if (!existing) throw new NotFoundError("Stakeholder", id)
    
    const updateData: any = { ...dto }
    if (dto.fechaUltimoContacto) {
      updateData.fechaUltimoContacto = new Date(dto.fechaUltimoContacto)
    }
    existing.updateInfo(updateData)
    await this.stakeholderRepo.save(existing)
    const updated = await this.stakeholderRepo.findById(id)
    return this.toDTO(updated || existing)
  }

  async registrarContacto(id: number, fechaStr?: string): Promise<StakeholderResponseDTO> {
    const existing = await this.stakeholderRepo.findById(id)
    if (!existing) throw new NotFoundError("Stakeholder", id)
    const fecha = fechaStr ? new Date(fechaStr) : new Date()
    existing.registrarContacto(fecha)
    await this.stakeholderRepo.save(existing)
    const updated = await this.stakeholderRepo.findById(id)
    return this.toDTO(updated || existing)
  }

  async delete(id: number): Promise<void> {
    const existing = await this.stakeholderRepo.findById(id)
    if (!existing) throw new NotFoundError("Stakeholder", id)
    await this.stakeholderRepo.delete(id)
  }

  async getById(id: number): Promise<StakeholderResponseDTO> {
    const entity = await this.stakeholderRepo.findById(id)
    if (!entity) throw new NotFoundError("Stakeholder", id)
    return this.toDTO(entity)
  }

  async list(params: FindStakeholdersParams): Promise<PaginatedResult<StakeholderResponseDTO>> {
    const result = await this.stakeholderRepo.findAll(params)
    return {
      ...result,
      data: result.data.map((e) => this.toDTO(e)),
    }
  }
}
