import { PrismaClient, Prisma } from "@prisma/client"
import { NotFoundError, AlreadyExistsError } from "../../shared-kernel/Errors"
import { paginateQuery, PaginatedResult } from "../../shared-kernel/Pagination"
import {
  IPartidoRepository,
  ICandidatoRepository,
  FindPartidosParams,
  FindCandidatosParams,
} from "../../modules/oposicion/domain/IOposicionRepository"
import { PartidoEntity } from "../../modules/oposicion/domain/PartidoEntity"
import { CandidatoEntity } from "../../modules/oposicion/domain/CandidatoEntity"

type PartidoRecord = Prisma.PartidoGetPayload<{ include: { _count: { select: { candidatos: true } } } }>
type CandidatoRecord = Prisma.CandidatoGetPayload<{ include: { partido: true } }>

export class PartidoRepository implements IPartidoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: PartidoRecord): PartidoEntity {
    const entity = new PartidoEntity(
      {
        nombre: record.nombre,
        sigla: record.sigla,
        color: record.color,
        referenteNombre: record.referenteNombre,
        observaciones: record.observaciones,
        activo: record.activo,
      },
      record.id,
    )
    entity.creadoEn = record.creadoEn
    entity.actualizadoEn = record.actualizadoEn
    entity.candidatosCount = record._count?.candidatos || 0
    return entity
  }

  async findById(id: number): Promise<PartidoEntity | null> {
    const record = await this.prisma.partido.findUnique({
      where: { id },
      include: { _count: { select: { candidatos: true } } },
    })
    return record ? this.toEntity(record) : null
  }

  async findAll(params: FindPartidosParams): Promise<PaginatedResult<PartidoEntity>> {
    const where: Prisma.PartidoWhereInput = {}
    if (params.activo !== undefined) where.activo = params.activo

    if (params.search && params.search.trim() !== "") {
      const q = params.search.trim()
      where.OR = [
        { nombre: { contains: q, mode: "insensitive" } },
        { sigla: { contains: q, mode: "insensitive" } },
        { referenteNombre: { contains: q, mode: "insensitive" } },
      ]
    }

    const { data, total, page, limit, totalPages } = await paginateQuery<PartidoRecord>(
      this.prisma.partido as any,
      { page: params.page, limit: params.limit },
      {
        where,
        include: { _count: { select: { candidatos: true } } },
        orderBy: [{ nombre: "asc" }],
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

  async listAllActivos(): Promise<PartidoEntity[]> {
    const records = await this.prisma.partido.findMany({
      where: { activo: true },
      include: { _count: { select: { candidatos: true } } },
      orderBy: [{ nombre: "asc" }],
    })
    return records.map((r) => this.toEntity(r))
  }

  async save(entity: PartidoEntity): Promise<PartidoEntity> {
    if (entity.id > 0) {
      try {
        const updated = await this.prisma.partido.update({
          where: { id: entity.id },
          data: {
            nombre: entity.nombre,
            sigla: entity.sigla || null,
            color: entity.color || null,
            referenteNombre: entity.referenteNombre || null,
            observaciones: entity.observaciones || null,
            activo: entity.activo,
            actualizadoEn: new Date(),
          },
          include: { _count: { select: { candidatos: true } } },
        })
        return this.toEntity(updated)
      } catch (err: any) {
        if (err.code === "P2002") throw new AlreadyExistsError("Partido", entity.nombre, "nombre")
        throw err
      }
    } else {
      try {
        const created = await this.prisma.partido.create({
          data: {
            nombre: entity.nombre,
            sigla: entity.sigla || null,
            color: entity.color || null,
            referenteNombre: entity.referenteNombre || null,
            observaciones: entity.observaciones || null,
            activo: entity.activo,
          },
          include: { _count: { select: { candidatos: true } } },
        })
        ;(entity as any)._id = created.id
        return this.toEntity(created)
      } catch (err: any) {
        if (err.code === "P2002") throw new AlreadyExistsError("Partido", entity.nombre, "nombre")
        throw err
      }
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.partido.delete({ where: { id } })
    } catch (err: any) {
      if (err.code === "P2025") throw new NotFoundError("Partido", id)
      throw err
    }
  }
}

export class CandidatoRepository implements ICandidatoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: CandidatoRecord): CandidatoEntity {
    const entity = new CandidatoEntity(
      {
        nombre: record.nombre,
        apellido: record.apellido,
        partidoId: record.partidoId,
        cargo: record.cargo,
        telefono: record.telefono,
        email: record.email,
        instagram: record.instagram,
        fortalezas: record.fortalezas,
        debilidades: record.debilidades,
        infoEstrategica: record.infoEstrategica,
        nivelAmenaza: record.nivelAmenaza,
        observaciones: record.observaciones,
        activo: record.activo,
      },
      record.id,
    )
    entity.creadoEn = record.creadoEn
    entity.actualizadoEn = record.actualizadoEn
    entity.partidoNombre = record.partido?.nombre || null
    entity.partidoColor = record.partido?.color || null
    return entity
  }

  async findById(id: number): Promise<CandidatoEntity | null> {
    const record = await this.prisma.candidato.findUnique({
      where: { id },
      include: { partido: true },
    })
    return record ? this.toEntity(record) : null
  }

  async findAll(params: FindCandidatosParams): Promise<PaginatedResult<CandidatoEntity>> {
    const where: Prisma.CandidatoWhereInput = {}
    if (params.activo !== undefined) where.activo = params.activo
    if (params.partidoId) where.partidoId = params.partidoId
    if (params.nivelAmenaza) where.nivelAmenaza = params.nivelAmenaza as any

    if (params.search && params.search.trim() !== "") {
      const q = params.search.trim()
      where.OR = [
        { nombre: { contains: q, mode: "insensitive" } },
        { apellido: { contains: q, mode: "insensitive" } },
        { cargo: { contains: q, mode: "insensitive" } },
        { fortalezas: { contains: q, mode: "insensitive" } },
        { infoEstrategica: { contains: q, mode: "insensitive" } },
      ]
    }

    const { data, total, page, limit, totalPages } = await paginateQuery<CandidatoRecord>(
      this.prisma.candidato as any,
      { page: params.page, limit: params.limit },
      {
        where,
        include: { partido: true },
        orderBy: [{ nivelAmenaza: "desc" }, { apellido: "asc" }],
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

  async save(entity: CandidatoEntity): Promise<CandidatoEntity> {
    if (entity.id > 0) {
      const updated = await this.prisma.candidato.update({
        where: { id: entity.id },
        data: {
          nombre: entity.nombre,
          apellido: entity.apellido,
          partidoId: entity.partidoId || null,
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
          actualizadoEn: new Date(),
        },
        include: { partido: true },
      })
      return this.toEntity(updated)
    } else {
      const created = await this.prisma.candidato.create({
        data: {
          nombre: entity.nombre,
          apellido: entity.apellido,
          partidoId: entity.partidoId || null,
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
        },
        include: { partido: true },
      })
      ;(entity as any)._id = created.id
      return this.toEntity(created)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.candidato.delete({ where: { id } })
    } catch (err: any) {
      if (err.code === "P2025") throw new NotFoundError("Candidato", id)
      throw err
    }
  }
}
