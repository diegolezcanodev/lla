import { PrismaClient, Prisma } from "@prisma/client"
import { NotFoundError, AlreadyExistsError } from "../../shared-kernel/Errors"
import { paginateQuery, PaginatedResult } from "../../shared-kernel/Pagination"
import { IEmpresaRepository, FindEmpresasParams } from "../../modules/empresas/domain/IEmpresaRepository"
import { EmpresaEntity } from "../../modules/empresas/domain/EmpresaEntity"

type EmpresaRecord = Prisma.EmpresaGetPayload<{ include: { barrio: true } }>

export class EmpresaRepository implements IEmpresaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: EmpresaRecord): EmpresaEntity {
    const entity = new EmpresaEntity(
      {
        nombre: record.nombre,
        direccion: record.direccion,
        barrioId: record.barrioId,
        rubro: record.rubro,
        tamano: record.tamano,
        cuit: record.cuit,
        telefono: record.telefono,
        email: record.email,
        contactoPrincipal: record.contactoPrincipal,
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

  async findById(id: number): Promise<EmpresaEntity | null> {
    const record = await this.prisma.empresa.findUnique({
      where: { id },
      include: { barrio: true },
    })
    return record ? this.toEntity(record) : null
  }

  async findAll(params: FindEmpresasParams): Promise<PaginatedResult<EmpresaEntity>> {
    const where: Prisma.EmpresaWhereInput = {}

    if (params.activa !== undefined) where.activa = params.activa
    if (params.barrioId) where.barrioId = params.barrioId
    if (params.tamano) where.tamano = params.tamano as any

    if (params.search && params.search.trim() !== "") {
      const q = params.search.trim()
      where.OR = [
        { nombre: { contains: q, mode: "insensitive" } },
        { direccion: { contains: q, mode: "insensitive" } },
        { rubro: { contains: q, mode: "insensitive" } },
        { cuit: { contains: q, mode: "insensitive" } },
        { contactoPrincipal: { contains: q, mode: "insensitive" } },
      ]
    }

    const { data, total, page, limit, totalPages } = await paginateQuery<EmpresaRecord>(
      this.prisma.empresa as any,
      { page: params.page, limit: params.limit },
      {
        where,
        include: { barrio: true },
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

  async save(entity: EmpresaEntity): Promise<EmpresaEntity> {
    if (entity.id > 0) {
      try {
        const updated = await this.prisma.empresa.update({
          where: { id: entity.id },
          data: {
            nombre: entity.nombre,
            direccion: entity.direccion,
            barrioId: entity.barrioId,
            rubro: entity.rubro || null,
            tamano: entity.tamano || null,
            cuit: entity.cuit || null,
            telefono: entity.telefono || null,
            email: entity.email || null,
            contactoPrincipal: entity.contactoPrincipal || null,
            observaciones: entity.observaciones || null,
            activa: entity.activa,
            actualizadoEn: new Date(),
          },
          include: { barrio: true },
        })
        return this.toEntity(updated)
      } catch (err: any) {
        if (err.code === "P2002") throw new AlreadyExistsError("Empresa", entity.cuit || entity.nombre, "cuit")
        throw err
      }
    } else {
      try {
        const created = await this.prisma.empresa.create({
          data: {
            nombre: entity.nombre,
            direccion: entity.direccion,
            barrioId: entity.barrioId,
            rubro: entity.rubro || null,
            tamano: entity.tamano || null,
            cuit: entity.cuit || null,
            telefono: entity.telefono || null,
            email: entity.email || null,
            contactoPrincipal: entity.contactoPrincipal || null,
            observaciones: entity.observaciones || null,
            activa: entity.activa,
          },
          include: { barrio: true },
        })
        ;(entity as any)._id = created.id
        return this.toEntity(created)
      } catch (err: any) {
        if (err.code === "P2002") throw new AlreadyExistsError("Empresa", entity.cuit || entity.nombre, "cuit")
        throw err
      }
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.empresa.delete({ where: { id } })
    } catch (err: any) {
      if (err.code === "P2025") throw new NotFoundError("Empresa", id)
      throw err
    }
  }
}
