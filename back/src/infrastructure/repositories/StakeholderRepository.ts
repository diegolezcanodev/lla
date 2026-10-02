import { PrismaClient, Prisma } from "@prisma/client"
import { NotFoundError } from "../../shared-kernel/Errors"
import { paginateQuery, PaginatedResult } from "../../shared-kernel/Pagination"
import { IStakeholderRepository, FindStakeholdersParams } from "../../modules/stakeholders/domain/IStakeholderRepository"
import { StakeholderEntity } from "../../modules/stakeholders/domain/StakeholderEntity"

type StakeholderRecord = Prisma.StakeholderGetPayload<{ include: { barrio: true } }>

export class StakeholderRepository implements IStakeholderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: StakeholderRecord): StakeholderEntity {
    const entity = new StakeholderEntity(
      {
        nombre: record.nombre,
        apellido: record.apellido,
        esAliado: record.esAliado,
        fechaUltimoContacto: record.fechaUltimoContacto,
        cargo: record.cargo,
        organizacion: record.organizacion,
        telefono: record.telefono,
        email: record.email,
        instagram: record.instagram,
        barrioId: record.barrioId,
        nivelInfluencia: record.nivelInfluencia,
        observaciones: record.observaciones,
        activo: record.activo,
      },
      record.id,
    )
    entity.creadoEn = record.creadoEn
    entity.actualizadoEn = record.actualizadoEn
    entity.barrioNombre = record.barrio?.nombre || null
    return entity
  }

  async findById(id: number): Promise<StakeholderEntity | null> {
    const record = await this.prisma.stakeholder.findUnique({
      where: { id },
      include: { barrio: true },
    })
    return record ? this.toEntity(record) : null
  }

  async findAll(params: FindStakeholdersParams): Promise<PaginatedResult<StakeholderEntity>> {
    const where: Prisma.StakeholderWhereInput = {}

    if (params.activo !== undefined) where.activo = params.activo
    if (params.barrioId) where.barrioId = params.barrioId
    if (params.esAliado !== undefined) where.esAliado = params.esAliado

    if (params.search && params.search.trim() !== "") {
      const q = params.search.trim()
      where.OR = [
        { nombre: { contains: q, mode: "insensitive" } },
        { apellido: { contains: q, mode: "insensitive" } },
        { cargo: { contains: q, mode: "insensitive" } },
        { organizacion: { contains: q, mode: "insensitive" } },
        { telefono: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ]
    }

    const { data, total, page, limit, totalPages } = await paginateQuery<StakeholderRecord>(
      this.prisma.stakeholder as any,
      { page: params.page, limit: params.limit },
      {
        where,
        include: { barrio: true },
        orderBy: [{ nivelInfluencia: "desc" }, { apellido: "asc" }],
      },
    )

    return {
      data: data.map((d) => this.toEntity(d)),
      total,
      page,
      limit,
      totalPages,
    }
  }

  async save(entity: StakeholderEntity): Promise<StakeholderEntity> {
    if (entity.id > 0) {
      const updated = await this.prisma.stakeholder.update({
        where: { id: entity.id },
        data: {
          nombre: entity.nombre,
          apellido: entity.apellido,
          esAliado: entity.esAliado,
          fechaUltimoContacto: entity.fechaUltimoContacto,
          cargo: entity.cargo || null,
          organizacion: entity.organizacion || null,
          telefono: entity.telefono || null,
          email: entity.email || null,
          instagram: entity.instagram || null,
          barrioId: entity.barrioId || null,
          nivelInfluencia: entity.nivelInfluencia,
          observaciones: entity.observaciones || null,
          activo: entity.activo,
          actualizadoEn: new Date(),
        },
        include: { barrio: true },
      })
      return this.toEntity(updated)
    } else {
      const created = await this.prisma.stakeholder.create({
        data: {
          nombre: entity.nombre,
          apellido: entity.apellido,
          esAliado: entity.esAliado,
          fechaUltimoContacto: entity.fechaUltimoContacto,
          cargo: entity.cargo || null,
          organizacion: entity.organizacion || null,
          telefono: entity.telefono || null,
          email: entity.email || null,
          instagram: entity.instagram || null,
          barrioId: entity.barrioId || null,
          nivelInfluencia: entity.nivelInfluencia,
          observaciones: entity.observaciones || null,
          activo: entity.activo,
        },
        include: { barrio: true },
      })
      ;(entity as any)._id = created.id
      return this.toEntity(created)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.stakeholder.delete({ where: { id } })
    } catch (err: any) {
      if (err.code === "P2025") throw new NotFoundError("Stakeholder", id)
      throw err
    }
  }
}
