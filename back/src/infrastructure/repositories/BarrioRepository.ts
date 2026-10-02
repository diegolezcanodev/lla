import { PrismaClient, Prisma, Barrio } from '@prisma/client'
import { NotFoundError, AlreadyExistsError } from '../../shared-kernel/Errors'
import { paginateQuery, PaginatedResult } from '../../shared-kernel/Pagination'
import { IBarrioRepository, FindBarriosParams } from '../../modules/barrios/domain/IBarrioRepository'
import { BarrioEntity } from '../../modules/barrios/domain/BarrioEntity'

export class BarrioRepository implements IBarrioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: Barrio): BarrioEntity {
    const entity = new BarrioEntity(
      {
        nombre: record.nombre,
        codigo: record.codigo,
        color: record.color,
        prioridad: record.prioridad,
        descripcion: record.descripcion,
        observaciones: record.observaciones,
        tags: record.tags,
        activo: record.activo,
      },
      record.id,
    )
    entity.creadoEn = record.creadoEn
    entity.actualizadoEn = record.actualizadoEn
    return entity
  }

  async findById(id: number): Promise<BarrioEntity | null> {
    const record = await this.prisma.barrio.findUnique({ where: { id } })
    return record ? this.toEntity(record) : null
  }

  async findByNombre(nombre: string): Promise<BarrioEntity | null> {
    const record = await this.prisma.barrio.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' } },
    })
    return record ? this.toEntity(record) : null
  }

  async findAll(params: FindBarriosParams): Promise<PaginatedResult<BarrioEntity>> {
    const where: Prisma.BarrioWhereInput = {}

    if (params.activo !== undefined) {
      where.activo = params.activo
    }

    if (params.prioridad) {
      where.prioridad = params.prioridad
    }

    if (params.search && params.search.trim() !== '') {
      const q = params.search.trim()
      where.OR = [
        { nombre: { contains: q, mode: 'insensitive' } },
        { codigo: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
        { observaciones: { contains: q, mode: 'insensitive' } },
      ]
    }

    const { data, total, page, limit, totalPages } = await paginateQuery<Barrio>(
      this.prisma.barrio,
      { page: params.page, limit: params.limit },
      {
        where,
        orderBy: [{ nombre: 'asc' }],
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

  async listAllActivos(): Promise<BarrioEntity[]> {
    const records = await this.prisma.barrio.findMany({
      where: { activo: true },
      orderBy: [{ prioridad: 'asc' }, { nombre: 'asc' }],
    })
    return records.map((r) => this.toEntity(r))
  }

  async save(entity: BarrioEntity): Promise<BarrioEntity> {
    if (entity.id > 0) {
      try {
        const updated = await this.prisma.barrio.update({
          where: { id: entity.id },
          data: {
            nombre: entity.nombre,
            codigo: entity.codigo || null,
            color: entity.color || null,
            prioridad: entity.prioridad,
            descripcion: entity.descripcion || null,
            observaciones: entity.observaciones || null,
            tags: entity.tags,
            activo: entity.activo,
            actualizadoEn: new Date(),
          },
        })
        return this.toEntity(updated)
      } catch (err: any) {
        if (err.code === 'P2002') {
          throw new AlreadyExistsError('Barrio', entity.nombre, 'nombre')
        }
        throw err
      }
    } else {
      try {
        const created = await this.prisma.barrio.create({
          data: {
            nombre: entity.nombre,
            codigo: entity.codigo || null,
            color: entity.color || null,
            prioridad: entity.prioridad,
            descripcion: entity.descripcion || null,
            observaciones: entity.observaciones || null,
            tags: entity.tags,
            activo: entity.activo,
          },
        })
        ;(entity as any)._id = created.id
        return this.toEntity(created)
      } catch (err: any) {
        if (err.code === 'P2002') {
          throw new AlreadyExistsError('Barrio', entity.nombre, 'nombre')
        }
        throw err
      }
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.barrio.delete({ where: { id } })
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundError('Barrio', id)
      }
      throw err
    }
  }
}
