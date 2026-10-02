import { PrismaClient, Prisma } from "@prisma/client"
import { NotFoundError } from "../../shared-kernel/Errors"
import { paginateQuery, PaginatedResult } from "../../shared-kernel/Pagination"
import { IReclamoRepository, FindReclamosParams } from "../../modules/reclamos/domain/IReclamoRepository"
import { ReclamoEntity } from "../../modules/reclamos/domain/ReclamoEntity"

type ReclamoRecord = Prisma.ReclamoGetPayload<{ include: { barrio: true; asignadoA: true } }>

export class ReclamoRepository implements IReclamoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: ReclamoRecord): ReclamoEntity {
    const entity = new ReclamoEntity(
      {
        vecino: record.vecino,
        titulo: record.titulo,
        descripcion: record.descripcion,
        dni: record.dni,
        telefono: record.telefono,
        barrioId: record.barrioId,
        direccion: record.direccion,
        categoria: record.categoria,
        estado: record.estado,
        prioridad: record.prioridad,
        respuesta: record.respuesta,
        asignadoAId: record.asignadoAId,
        observaciones: record.observaciones,
      },
      record.id,
    )
    entity.creadoEn = record.creadoEn
    entity.actualizadoEn = record.actualizadoEn
    entity.barrioNombre = record.barrio?.nombre || null
    entity.asignadoANombre = record.asignadoA ? `${record.asignadoA.nombre} ${record.asignadoA.apellido}` : null
    return entity
  }

  async findById(id: number): Promise<ReclamoEntity | null> {
    const record = await this.prisma.reclamo.findUnique({
      where: { id },
      include: { barrio: true, asignadoA: true },
    })
    return record ? this.toEntity(record) : null
  }

  async findAll(params: FindReclamosParams): Promise<PaginatedResult<ReclamoEntity>> {
    const where: Prisma.ReclamoWhereInput = {}

    if (params.barrioId) where.barrioId = params.barrioId
    if (params.categoria) where.categoria = params.categoria as any
    if (params.estado) where.estado = params.estado as any
    if (params.prioridad) where.prioridad = params.prioridad as any
    if (params.asignadoAId) where.asignadoAId = params.asignadoAId

    if (params.search && params.search.trim() !== "") {
      const q = params.search.trim()
      where.OR = [
        { vecino: { contains: q, mode: "insensitive" } },
        { titulo: { contains: q, mode: "insensitive" } },
        { descripcion: { contains: q, mode: "insensitive" } },
        { direccion: { contains: q, mode: "insensitive" } },
        { dni: { contains: q, mode: "insensitive" } },
      ]
    }

    const { data, total, page, limit, totalPages } = await paginateQuery<ReclamoRecord>(
      this.prisma.reclamo as any,
      { page: params.page, limit: params.limit },
      {
        where,
        include: { barrio: true, asignadoA: true },
        orderBy: [{ creadoEn: "desc" }],
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

  async save(entity: ReclamoEntity): Promise<ReclamoEntity> {
    if (entity.id > 0) {
      const updated = await this.prisma.reclamo.update({
        where: { id: entity.id },
        data: {
          vecino: entity.vecino,
          titulo: entity.titulo,
          descripcion: entity.descripcion,
          dni: entity.dni || null,
          telefono: entity.telefono || null,
          barrioId: entity.barrioId || null,
          direccion: entity.direccion || null,
          categoria: entity.categoria,
          estado: entity.estado,
          prioridad: entity.prioridad,
          respuesta: entity.respuesta || null,
          asignadoAId: entity.asignadoAId || null,
          observaciones: entity.observaciones || null,
          actualizadoEn: new Date(),
        },
        include: { barrio: true, asignadoA: true },
      })
      return this.toEntity(updated)
    } else {
      const created = await this.prisma.reclamo.create({
        data: {
          vecino: entity.vecino,
          titulo: entity.titulo,
          descripcion: entity.descripcion,
          dni: entity.dni || null,
          telefono: entity.telefono || null,
          barrioId: entity.barrioId || null,
          direccion: entity.direccion || null,
          categoria: entity.categoria,
          estado: entity.estado,
          prioridad: entity.prioridad,
          respuesta: entity.respuesta || null,
          asignadoAId: entity.asignadoAId || null,
          observaciones: entity.observaciones || null,
        },
        include: { barrio: true, asignadoA: true },
      })
      ;(entity as any)._id = created.id
      return this.toEntity(created)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.reclamo.delete({ where: { id } })
    } catch (err: any) {
      if (err.code === "P2025") throw new NotFoundError("Reclamo", id)
      throw err
    }
  }
}
