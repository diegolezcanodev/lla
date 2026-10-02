import { PrismaClient, Prisma } from "@prisma/client"
import { NotFoundError } from "../../shared-kernel/Errors"
import { paginateQuery, PaginatedResult } from "../../shared-kernel/Pagination"
import { IEscuelaRepository, FindEscuelasParams } from "../../modules/escuelas/domain/IEscuelaRepository"
import { EscuelaEntity } from "../../modules/escuelas/domain/EscuelaEntity"

type EscuelaRecord = Prisma.EscuelaGetPayload<{ include: { barrio: true } }>

export class EscuelaRepository implements IEscuelaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: EscuelaRecord): EscuelaEntity {
    const entity = new EscuelaEntity(
      {
        nombre: record.nombre,
        nivel: record.nivel,
        numero: record.numero,
        modalidad: record.modalidad,
        direccion: record.direccion,
        barrioId: record.barrioId,
        director: record.director,
        telefonoDirector: record.telefonoDirector,
        emailDirector: record.emailDirector,
        observaciones: record.observaciones,
        activa: record.activa,
      },
      record.id,
    )
    entity.creadoEn = record.creadoEn
    entity.actualizadoEn = record.actualizadoEn
    entity.barrioNombre = record.barrio?.nombre || null
    return entity
  }

  async findById(id: number): Promise<EscuelaEntity | null> {
    const record = await this.prisma.escuela.findUnique({
      where: { id },
      include: { barrio: true },
    })
    return record ? this.toEntity(record) : null
  }

  async findAll(params: FindEscuelasParams): Promise<PaginatedResult<EscuelaEntity>> {
    const where: Prisma.EscuelaWhereInput = {}

    if (params.activa !== undefined) where.activa = params.activa
    if (params.barrioId) where.barrioId = params.barrioId
    if (params.nivel) where.nivel = params.nivel as any

    if (params.search && params.search.trim() !== "") {
      const q = params.search.trim()
      where.OR = [
        { nombre: { contains: q, mode: "insensitive" } },
        { direccion: { contains: q, mode: "insensitive" } },
        { modalidad: { contains: q, mode: "insensitive" } },
        { director: { contains: q, mode: "insensitive" } },
      ]
    }

    const { data, total, page, limit, totalPages } = await paginateQuery<EscuelaRecord>(
      this.prisma.escuela as any,
      { page: params.page, limit: params.limit },
      {
        where,
        include: { barrio: true },
        orderBy: [{ nivel: "asc" }, { nombre: "asc" }],
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

  async save(entity: EscuelaEntity): Promise<EscuelaEntity> {
    if (entity.id > 0) {
      const updated = await this.prisma.escuela.update({
        where: { id: entity.id },
        data: {
          nombre: entity.nombre,
          nivel: entity.nivel,
          numero: entity.numero || null,
          modalidad: entity.modalidad || null,
          direccion: entity.direccion || null,
          barrioId: entity.barrioId || null,
          director: entity.director || null,
          telefonoDirector: entity.telefonoDirector || null,
          emailDirector: entity.emailDirector || null,
          observaciones: entity.observaciones || null,
          activa: entity.activa,
          actualizadoEn: new Date(),
        },
        include: { barrio: true },
      })
      return this.toEntity(updated)
    } else {
      const created = await this.prisma.escuela.create({
        data: {
          nombre: entity.nombre,
          nivel: entity.nivel,
          numero: entity.numero || null,
          modalidad: entity.modalidad || null,
          direccion: entity.direccion || null,
          barrioId: entity.barrioId || null,
          director: entity.director || null,
          telefonoDirector: entity.telefonoDirector || null,
          emailDirector: entity.emailDirector || null,
          observaciones: entity.observaciones || null,
          activa: entity.activa,
        },
        include: { barrio: true },
      })
      ;(entity as any)._id = created.id
      return this.toEntity(created)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.escuela.delete({ where: { id } })
    } catch (err: any) {
      if (err.code === "P2025") throw new NotFoundError("Escuela", id)
      throw err
    }
  }
}
