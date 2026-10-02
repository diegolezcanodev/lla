import { IEmpresaAppService } from "./IEmpresaAppService"
import { IEmpresaRepository, FindEmpresasParams } from "../domain/IEmpresaRepository"
import { EmpresaEntity } from "../domain/EmpresaEntity"
import { CreateEmpresaDTO, UpdateEmpresaDTO, EmpresaResponseDTO } from "./EmpresaDTO"
import { NotFoundError } from "../../../shared-kernel/Errors"
import { PaginatedResult } from "../../../shared-kernel/Pagination"

export class EmpresaAppService implements IEmpresaAppService {
  constructor(private readonly empresaRepo: IEmpresaRepository) {}

  private toDTO(entity: EmpresaEntity): EmpresaResponseDTO {
    return {
      id: entity.id,
      nombre: entity.nombre,
      direccion: entity.direccion,
      barrioId: entity.barrioId,
      barrioNombre: entity.barrioNombre || null,
      rubro: entity.rubro || null,
      tamano: entity.tamano || null,
      cuit: entity.cuit || null,
      telefono: entity.telefono || null,
      email: entity.email || null,
      contactoPrincipal: entity.contactoPrincipal || null,
      observaciones: entity.observaciones || null,
      activa: entity.activa,
      creadoEn: entity.creadoEn.toISOString(),
      actualizadoEn: entity.actualizadoEn.toISOString(),
    }
  }

  async create(dto: CreateEmpresaDTO): Promise<EmpresaResponseDTO> {
    const entity = new EmpresaEntity({
      nombre: dto.nombre,
      direccion: dto.direccion,
      barrioId: dto.barrioId,
      rubro: dto.rubro,
      tamano: dto.tamano,
      cuit: dto.cuit,
      telefono: dto.telefono,
      email: dto.email,
      contactoPrincipal: dto.contactoPrincipal,
      observaciones: dto.observaciones,
      activa: true,
    })
    const saved = await this.empresaRepo.save(entity)
    const full = await this.empresaRepo.findById(saved.id)
    return this.toDTO(full || saved)
  }

  async update(id: number, dto: UpdateEmpresaDTO): Promise<EmpresaResponseDTO> {
    const existing = await this.empresaRepo.findById(id)
    if (!existing) throw new NotFoundError("Empresa", id)
    existing.updateInfo(dto)
    await this.empresaRepo.save(existing)
    const updated = await this.empresaRepo.findById(id)
    return this.toDTO(updated || existing)
  }

  async delete(id: number): Promise<void> {
    const existing = await this.empresaRepo.findById(id)
    if (!existing) throw new NotFoundError("Empresa", id)
    await this.empresaRepo.delete(id)
  }

  async getById(id: number): Promise<EmpresaResponseDTO> {
    const entity = await this.empresaRepo.findById(id)
    if (!entity) throw new NotFoundError("Empresa", id)
    return this.toDTO(entity)
  }

  async list(params: FindEmpresasParams): Promise<PaginatedResult<EmpresaResponseDTO>> {
    const result = await this.empresaRepo.findAll(params)
    return {
      ...result,
      data: result.data.map((e) => this.toDTO(e)),
    }
  }
}
