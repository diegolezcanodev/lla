import { PrismaClient, Prisma } from "@prisma/client"
import { NotFoundError } from "../../shared-kernel/Errors"
import { paginateQuery, PaginatedResult } from "../../shared-kernel/Pagination"
import { ITareaRepository, FindTareasParams } from "../../modules/tareas/domain/ITareaRepository"
import { TareaEntity, ComentarioItem } from "../../modules/tareas/domain/TareaEntity"

type TareaRecord = Prisma.TareaGetPayload<{
  include: {
    barrio: true
    asignados: {
      include: {
        miembroEquipo: true
      }
    }
    comentarios: { orderBy: { creadoEn: "asc" } }
  }
}>

export class TareaRepository implements ITareaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: TareaRecord): TareaEntity {
    const entity = new TareaEntity(
      {
        titulo: record.titulo,
        descripcion: record.descripcion,
        estado: record.estado,
        prioridad: record.prioridad,
        fechaLimite: record.fechaLimite,
        barrioId: record.barrioId,
        etiquetas: record.etiquetas,
        observaciones: record.observaciones,
      },
      record.id,
    )
    entity.creadoEn = record.creadoEn
    entity.actualizadoEn = record.actualizadoEn
    entity.barrioNombre = record.barrio?.nombre || null
    entity.asignados = (record.asignados || []).map((a) => ({
      id: a.miembroEquipo.id,
      nombre: a.miembroEquipo.nombre,
      apellido: a.miembroEquipo.apellido,
    }))
    entity.comentarios = record.comentarios.map((c) => ({
      id: c.id,
      autor: c.autor,
      mensaje: c.mensaje,
      usuarioId: c.usuarioId || null,
      creadoEn: c.creadoEn.toISOString(),
    }))
    return entity
  }

  async findById(id: number): Promise<TareaEntity | null> {
    const record = await this.prisma.tarea.findUnique({
      where: { id },
      include: {
        barrio: true,
        asignados: {
          include: {
            miembroEquipo: true,
          },
        },
        comentarios: { orderBy: { creadoEn: "asc" } },
      },
    })
    return record ? this.toEntity(record) : null
  }

  async findAll(params: FindTareasParams): Promise<PaginatedResult<TareaEntity>> {
    const where: Prisma.TareaWhereInput = {}

    if (params.estado) where.estado = params.estado as any
    if (params.prioridad) where.prioridad = params.prioridad as any
    if (params.asignadoAId) {
      where.asignados = {
        some: {
          miembroEquipoId: params.asignadoAId,
        },
      }
    }
    if (params.barrioId) where.barrioId = params.barrioId

    if (params.search && params.search.trim() !== "") {
      const q = params.search.trim()
      where.OR = [
        { titulo: { contains: q, mode: "insensitive" } },
        { descripcion: { contains: q, mode: "insensitive" } },
      ]
    }

    const { data, total, page, limit, totalPages } = await paginateQuery<TareaRecord>(
      this.prisma.tarea as any,
      { page: params.page, limit: params.limit },
      {
        where,
        include: {
          barrio: true,
          asignados: {
            include: {
              miembroEquipo: true,
            },
          },
          comentarios: { orderBy: { creadoEn: "asc" } },
        },
        orderBy: [{ fechaLimite: "asc" }, { creadoEn: "desc" }],
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

  async save(entity: TareaEntity): Promise<TareaEntity> {
    if (entity.id > 0) {
      await this.prisma.tarea.update({
        where: { id: entity.id },
        data: {
          titulo: entity.titulo,
          descripcion: entity.descripcion || null,
          estado: entity.estado,
          prioridad: entity.prioridad,
          fechaLimite: entity.fechaLimite || null,
          barrioId: entity.barrioId || null,
          etiquetas: entity.etiquetas,
          observaciones: entity.observaciones || null,
          actualizadoEn: new Date(),
        },
      })

      if (entity.asignadosIds !== undefined) {
        await this.prisma.tareaAsignado.deleteMany({
          where: { tareaId: entity.id },
        })
        if (entity.asignadosIds.length > 0) {
          await this.prisma.tareaAsignado.createMany({
            data: entity.asignadosIds.map((miembroEquipoId) => ({
              tareaId: entity.id,
              miembroEquipoId,
            })),
            skipDuplicates: true,
          })
        }
      }

      const updated = await this.prisma.tarea.findUniqueOrThrow({
        where: { id: entity.id },
        include: {
          barrio: true,
          asignados: {
            include: {
              miembroEquipo: true,
            },
          },
          comentarios: { orderBy: { creadoEn: "asc" } },
        },
      })
      return this.toEntity(updated)
    } else {
      const created = await this.prisma.tarea.create({
        data: {
          titulo: entity.titulo,
          descripcion: entity.descripcion || null,
          estado: entity.estado,
          prioridad: entity.prioridad,
          fechaLimite: entity.fechaLimite || null,
          barrioId: entity.barrioId || null,
          etiquetas: entity.etiquetas,
          observaciones: entity.observaciones || null,
          asignados:
            entity.asignadosIds && entity.asignadosIds.length > 0
              ? {
                  create: entity.asignadosIds.map((miembroEquipoId) => ({
                    miembroEquipoId,
                  })),
                }
              : undefined,
        },
        include: {
          barrio: true,
          asignados: {
            include: {
              miembroEquipo: true,
            },
          },
          comentarios: { orderBy: { creadoEn: "asc" } },
        },
      })
      ;(entity as any)._id = created.id
      return this.toEntity(created)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.tarea.delete({ where: { id } })
    } catch (err: any) {
      if (err.code === "P2025") throw new NotFoundError("Tarea", id)
      throw err
    }
  }

  async addComentario(tareaId: number, autor: string, mensaje: string, usuarioId?: number): Promise<ComentarioItem> {
    const record = await this.prisma.comentarioTarea.create({
      data: {
        tareaId,
        autor,
        mensaje,
        usuarioId: usuarioId || null,
      },
    })
    return {
      id: record.id,
      autor: record.autor,
      mensaje: record.mensaje,
      usuarioId: record.usuarioId,
      creadoEn: record.creadoEn.toISOString(),
    }
  }
}
