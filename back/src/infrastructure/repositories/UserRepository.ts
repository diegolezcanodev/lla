import { PrismaClient, Prisma } from '@prisma/client'
import { NotFoundError, AlreadyExistsError } from '../../shared-kernel/Errors'
import { paginateQuery } from '../../shared-kernel/Pagination'
import type { PaginationInput, PaginatedResult } from '../../shared-kernel/Pagination'
import { UserEntity } from '../../modules/users/domain/UserEntity'
import { IUserRepository } from '../../modules/users/domain/IUserRepository'

type UsuarioWithRoles = Prisma.UsuarioGetPayload<{
  include: { usuarioRoles: { include: { rol: true } } }
}>

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: UserEntity): Promise<void> {
    if (user.id > 0) {
      const data: Prisma.UsuarioUpdateInput = {
        email: user.email,
        nombreUsuario: user.nombreUsuario,
        contrasena: user.contrasena,
        nombre: user.nombre,
        apellido: user.apellido,
        activo: user.activo,
        actualizadoEn: user.actualizadoEn,
      }
      if (user.rolIds.length > 0) {
        data.usuarioRoles = {
          deleteMany: {},
          create: user.rolIds.map((rolId) => ({ rolId })),
        }
      }
      try {
        await this.prisma.usuario.update({ where: { id: user.id }, data })
      } catch (err) {
        this.handleUniqueConstraintError(err, user)
      }
      await this.refreshRolNombres(user)
    } else {
      let record: { id: number }
      try {
        record = await this.prisma.usuario.create({
          data: {
            email: user.email,
            nombreUsuario: user.nombreUsuario,
            contrasena: user.contrasena,
            nombre: user.nombre,
            apellido: user.apellido,
            activo: user.activo,
            usuarioRoles:
              user.rolIds.length > 0
                ? { create: user.rolIds.map((rolId) => ({ rolId })) }
                : undefined,
          },
        })
      } catch (err) {
        this.handleUniqueConstraintError(err, user)
      }
      ;(user as any)._id = record.id
      await this.refreshRolNombres(user)
    }
  }

  private handleUniqueConstraintError(err: unknown, user: UserEntity): never {
    const isP2002 =
      (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') ||
      (err as any)?.code === 'P2002'

    if (isP2002) {
      const target = (
        Array.isArray((err as any)?.meta?.target)
          ? (err as any).meta.target.join(' ')
          : String((err as any)?.meta?.target || '')
      ).toLowerCase()

      if (target.includes('nombreusuario') || target.includes('nombre')) {
        const error = new AlreadyExistsError('Usuario', user.nombreUsuario || '', 'nombreUsuario')
        error.message = `El nombre de usuario "${user.nombreUsuario}" ya está en uso`
        throw error
      }

      if (target.includes('email')) {
        const error = new AlreadyExistsError('Usuario', user.email, 'email')
        error.message = `El email "${user.email}" ya está registrado`
        throw error
      }

      const error = new AlreadyExistsError(
        'Usuario',
        user.nombreUsuario || user.email,
        user.nombreUsuario ? 'nombreUsuario' : 'email',
      )
      error.message = user.nombreUsuario
        ? `El nombre de usuario "${user.nombreUsuario}" ya está en uso`
        : `El email "${user.email}" ya está registrado`
      throw error
    }
    throw err
  }

  private async refreshRolNombres(user: UserEntity): Promise<void> {
    const roles = await this.prisma.rol.findMany({
      where: { id: { in: user.rolIds } },
    })
    user.rolNombres = roles.map((r) => r.nombre)
  }

  async findById(id: number): Promise<UserEntity> {
    const record = await this.prisma.usuario.findUnique({
      where: { id },
      include: { usuarioRoles: { include: { rol: true } } },
    })
    if (!record) throw new NotFoundError('Usuario', id)
    return this.toEntity(record)
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const record = await this.prisma.usuario.findUnique({
      where: { email },
      include: { usuarioRoles: { include: { rol: true } } },
    })
    if (!record) throw new NotFoundError('Usuario', email)
    return this.toEntity(record)
  }

  async findByEmailOrUsername(identifier: string): Promise<UserEntity> {
    const record = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { nombreUsuario: { equals: identifier, mode: 'insensitive' } },
        ],
      },
      include: { usuarioRoles: { include: { rol: true } } },
    })
    if (!record) throw new NotFoundError('Usuario', identifier)
    return this.toEntity(record)
  }

  async findAllPaginated(params: PaginationInput, search?: string): Promise<PaginatedResult<UserEntity>> {
    const where: Prisma.UsuarioWhereInput = {}
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { nombreUsuario: { contains: search, mode: 'insensitive' } },
      ]
    }
    const result = await paginateQuery<UsuarioWithRoles>(this.prisma.usuario, params, {
      where,
      orderBy: { creadoEn: 'desc' },
      include: { usuarioRoles: { include: { rol: true } } },
    })
    return {
      ...result,
      data: result.data.map((r) => this.toEntity(r)),
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.usuario.delete({ where: { id } })
    } catch {
      throw new NotFoundError('Usuario', id)
    }
  }

  private toEntity(record: UsuarioWithRoles): UserEntity {
    const entity = new UserEntity(
      {
        email: record.email,
        nombreUsuario: record.nombreUsuario,
        contrasena: record.contrasena,
        nombre: record.nombre,
        apellido: record.apellido,
      },
      record.id,
    )
    entity.creadoEn = record.creadoEn
    entity.actualizadoEn = record.actualizadoEn
    entity.activo = record.activo
    entity.rolIds = record.usuarioRoles.map((ur) => ur.rol.id)
    entity.rolNombres = record.usuarioRoles.map((ur) => ur.rol.nombre)
    return entity
  }
}
