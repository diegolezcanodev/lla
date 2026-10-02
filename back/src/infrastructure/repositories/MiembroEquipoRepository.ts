import { PrismaClient, Prisma, TipoMiembro } from '@prisma/client'
import { NotFoundError, AlreadyExistsError } from '../../shared-kernel/Errors'
import { paginateQuery, PaginatedResult } from '../../shared-kernel/Pagination'
import {
  IMiembroEquipoRepository,
  FindEquipoParams,
} from '../../modules/equipo/domain/IMiembroEquipoRepository'
import { MiembroEquipoEntity } from '../../modules/equipo/domain/MiembroEquipoEntity'

type MiembroEquipoWithRelations = Prisma.MiembroEquipoGetPayload<{
  include: {
    usuario: {
      select: {
        email: true
        usuarioRoles: {
          include: {
            rol: true
          }
        }
      }
    }
    barrio: {
      select: {
        id: true
        nombre: true
      }
    }
  }
}>

export class MiembroEquipoRepository implements IMiembroEquipoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: MiembroEquipoWithRelations): MiembroEquipoEntity {
    const entity = new MiembroEquipoEntity(
      {
        nombre: record.nombre,
        apellido: record.apellido,
        dni: record.dni,
        telefono: record.telefono,
        email: record.email,
        instagram: record.instagram,
        barrioId: record.barrioId,
        direccion: record.direccion,
        tipo: record.tipo,
        activo: record.activo,
        observaciones: record.observaciones,
        usuarioId: record.usuarioId,
      },
      record.id,
    )
    entity.creadoEn = record.creadoEn
    entity.actualizadoEn = record.actualizadoEn
    entity.usuarioEmail = record.usuario?.email ?? null
    entity.usuarioRoles = record.usuario?.usuarioRoles.map((ur) => ur.rol.nombre) ?? []
    entity.barrioNombre = record.barrio?.nombre ?? null
    return entity
  }

  async findById(id: number): Promise<MiembroEquipoEntity | null> {
    const record = await this.prisma.miembroEquipo.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            email: true,
            usuarioRoles: { include: { rol: true } },
          },
        },
        barrio: {
          select: { id: true, nombre: true },
        },
      },
    })
    return record ? this.toEntity(record) : null
  }

  async findByDni(dni: string): Promise<MiembroEquipoEntity | null> {
    const record = await this.prisma.miembroEquipo.findUnique({
      where: { dni },
      include: {
        usuario: {
          select: {
            email: true,
            usuarioRoles: { include: { rol: true } },
          },
        },
        barrio: {
          select: { id: true, nombre: true },
        },
      },
    })
    return record ? this.toEntity(record) : null
  }

  async findByUsuarioId(usuarioId: number): Promise<MiembroEquipoEntity | null> {
    const record = await this.prisma.miembroEquipo.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            email: true,
            usuarioRoles: { include: { rol: true } },
          },
        },
        barrio: {
          select: { id: true, nombre: true },
        },
      },
    })
    return record ? this.toEntity(record) : null
  }

  async findAll(params: FindEquipoParams): Promise<PaginatedResult<MiembroEquipoEntity>> {
    const where: Prisma.MiembroEquipoWhereInput = {}

    if (params.activo !== undefined) {
      where.activo = params.activo
    }

    if (params.tipo && params.tipo !== 'TODOS') {
      where.tipo = params.tipo as TipoMiembro
    }

    if (params.barrioId) {
      where.barrioId = params.barrioId
    }

    if (params.search && params.search.trim() !== '') {
      const q = params.search.trim()
      where.OR = [
        { nombre: { contains: q, mode: 'insensitive' } },
        { apellido: { contains: q, mode: 'insensitive' } },
        { dni: { contains: q, mode: 'insensitive' } },
        { telefono: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { instagram: { contains: q, mode: 'insensitive' } },
        { direccion: { contains: q, mode: 'insensitive' } },
        { barrio: { nombre: { contains: q, mode: 'insensitive' } } },
      ]
    }

    const { data, total, page, limit, totalPages } = await paginateQuery<MiembroEquipoWithRelations>(
      this.prisma.miembroEquipo,
      { page: params.page, limit: params.limit },
      {
        where,
        include: {
          usuario: {
            select: {
              email: true,
              usuarioRoles: { include: { rol: true } },
            },
          },
          barrio: {
            select: { id: true, nombre: true },
          },
        },
        orderBy: [{ actualizadoEn: 'desc' }, { id: 'desc' }],
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

  async save(entity: MiembroEquipoEntity): Promise<MiembroEquipoEntity> {
    if (entity.id > 0) {
      try {
        const updated = await this.prisma.miembroEquipo.update({
          where: { id: entity.id },
          data: {
            nombre: entity.nombre,
            apellido: entity.apellido,
            dni: entity.dni || null,
            telefono: entity.telefono || null,
            email: entity.email || null,
            instagram: entity.instagram || null,
            barrioId: entity.barrioId || null,
            direccion: entity.direccion || null,
            tipo: entity.tipo,
            activo: entity.activo,
            observaciones: entity.observaciones || null,
            usuarioId: entity.usuarioId || null,
            actualizadoEn: new Date(),
          },
          include: {
            usuario: {
              select: {
                email: true,
                usuarioRoles: { include: { rol: true } },
              },
            },
            barrio: {
              select: { id: true, nombre: true },
            },
          },
        })
        return this.toEntity(updated)
      } catch (err: any) {
        if (err.code === 'P2002') {
          const target = (err.meta?.target as string[]) || []
          if (target.includes('dni')) {
            throw new AlreadyExistsError('MiembroEquipo', entity.dni ?? '', 'dni')
          }
          if (target.includes('usuarioId')) {
            throw new AlreadyExistsError('MiembroEquipo', String(entity.usuarioId), 'usuarioId')
          }
        }
        throw err
      }
    } else {
      try {
        const created = await this.prisma.miembroEquipo.create({
          data: {
            nombre: entity.nombre,
            apellido: entity.apellido,
            dni: entity.dni || null,
            telefono: entity.telefono || null,
            email: entity.email || null,
            instagram: entity.instagram || null,
            barrioId: entity.barrioId || null,
            direccion: entity.direccion || null,
            tipo: entity.tipo,
            activo: entity.activo,
            observaciones: entity.observaciones || null,
            usuarioId: entity.usuarioId || null,
          },
          include: {
            usuario: {
              select: {
                email: true,
                usuarioRoles: { include: { rol: true } },
              },
            },
            barrio: {
              select: { id: true, nombre: true },
            },
          },
        })
        ;(entity as any)._id = created.id
        return this.toEntity(created)
      } catch (err: any) {
        if (err.code === 'P2002') {
          const target = (err.meta?.target as string[]) || []
          if (target.includes('dni')) {
            throw new AlreadyExistsError('MiembroEquipo', entity.dni ?? '', 'dni')
          }
          if (target.includes('usuarioId')) {
            throw new AlreadyExistsError('MiembroEquipo', String(entity.usuarioId), 'usuarioId')
          }
        }
        throw err
      }
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.miembroEquipo.delete({ where: { id } })
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundError('MiembroEquipo', id)
      }
      throw err
    }
  }
}
