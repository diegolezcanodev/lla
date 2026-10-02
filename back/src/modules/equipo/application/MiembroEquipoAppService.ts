import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import {
  ConflictError,
  AlreadyExistsError,
  NotFoundError,
} from '../../../shared-kernel/Errors'
import { PaginatedResult } from '../../../shared-kernel/Pagination'
import {
  IMiembroEquipoRepository,
  FindEquipoParams,
} from '../domain/IMiembroEquipoRepository'
import { MiembroEquipoEntity } from '../domain/MiembroEquipoEntity'
import { IMiembroEquipoAppService } from './IMiembroEquipoAppService'
import {
  CreateMiembroEquipoDTO,
  UpdateMiembroEquipoDTO,
  MiembroEquipoResponseDTO,
} from './MiembroEquipoDTO'

function toResponseDTO(entity: MiembroEquipoEntity): MiembroEquipoResponseDTO {
  return {
    id: entity.id,
    nombre: entity.nombre,
    apellido: entity.apellido,
    dni: entity.dni ?? null,
    telefono: entity.telefono ?? null,
    email: entity.email ?? null,
    instagram: entity.instagram ?? null,
    barrioId: entity.barrioId ?? null,
    barrioNombre: entity.barrioNombre ?? null,
    direccion: entity.direccion ?? null,
    tipo: entity.tipo,
    activo: entity.activo,
    observaciones: entity.observaciones ?? null,
    usuarioId: entity.usuarioId ?? null,
    usuarioEmail: entity.usuarioEmail ?? null,
    creadoEn: entity.creadoEn.toISOString(),
    actualizadoEn: entity.actualizadoEn.toISOString(),
  }
}

export class MiembroEquipoAppService implements IMiembroEquipoAppService {
  constructor(
    private readonly repository: IMiembroEquipoRepository,
    private readonly prisma: PrismaClient,
  ) {}

  private sanitizeForUsername(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '')
  }

  private async generateUniqueUsername(nombre: string, apellido: string): Promise<string> {
    const cleanNombre = this.sanitizeForUsername(nombre)
    const cleanApellido = this.sanitizeForUsername(apellido)
    let base = `${cleanNombre}${cleanApellido}`

    if (base.length < 4) {
      base = (base + 'user').padEnd(4, '0')
    }
    if (base.length > 25) {
      base = base.slice(0, 25)
    }

    let candidate = base
    let counter = 1

    while (true) {
      const existing = await this.prisma.usuario.findFirst({
        where: {
          OR: [{ nombreUsuario: candidate }, { email: candidate }],
        },
      })
      if (!existing) return candidate
      candidate = `${base}${counter}`
      if (candidate.length > 30) {
        const cutBase = base.slice(0, 30 - String(counter).length)
        candidate = `${cutBase}${counter}`
      }
      counter++
    }
  }

  private async getOrCreateRole(roleName: string): Promise<number> {
    const role = await this.prisma.rol.upsert({
      where: { nombre: roleName },
      update: {},
      create: { nombre: roleName },
    })
    return role.id
  }

  async create(dto: CreateMiembroEquipoDTO): Promise<MiembroEquipoResponseDTO> {
    const nombre = dto.nombre.trim()
    const apellido = dto.apellido.trim()
    const dni = dto.dni?.trim() || null
    const telefono = dto.telefono?.trim() || null
    const email = dto.email?.trim().toLowerCase() || null
    const instagram = dto.instagram?.trim().replace(/^@/, '') || null
    const barrioId = dto.barrioId || null
    const direccion = dto.direccion?.trim() || null
    const tipo = dto.tipo

    if (dni) {
      const existingDni = await this.repository.findByDni(dni)
      if (existingDni) {
        throw new AlreadyExistsError('MiembroEquipo', dni, 'dni')
      }
    }

    let usuarioId: number | null = null

    // Usuario opcional: sólo si es EQUIPO o ESTRATEGIA, y tiene tanto email como contraseña
    if ((tipo === 'EQUIPO' || tipo === 'ESTRATEGIA') && email && dto.contrasena && dto.contrasena.length >= 6) {
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email },
      })

      if (existingUser) {
        const linkedMember = await this.repository.findByUsuarioId(existingUser.id)
        if (linkedMember) {
          throw new ConflictError(`El email "${email}" ya está asociado a otro miembro del equipo`)
        }
        usuarioId = existingUser.id
      } else {
        const roleName = tipo === 'EQUIPO' ? 'Equipo' : 'Estrategia'
        const roleId = await this.getOrCreateRole(roleName)
        const hashedPassword = await bcrypt.hash(dto.contrasena, 10)
        const username =
          dto.nombreUsuario?.trim().toLowerCase() ||
          (await this.generateUniqueUsername(nombre, apellido))

        const newUser = await this.prisma.usuario.create({
          data: {
            email,
            nombreUsuario: username,
            contrasena: hashedPassword,
            nombre,
            apellido,
            activo: true,
            usuarioRoles: {
              create: [{ rolId: roleId }],
            },
          },
        })
        usuarioId = newUser.id
      }
    }

    const entity = new MiembroEquipoEntity({
      nombre,
      apellido,
      dni,
      telefono,
      email,
      instagram,
      barrioId,
      direccion,
      tipo,
      observaciones: dto.observaciones?.trim() || null,
      usuarioId,
    })

    const saved = await this.repository.save(entity)
    return toResponseDTO(saved)
  }

  async update(id: number, dto: UpdateMiembroEquipoDTO): Promise<MiembroEquipoResponseDTO> {
    const member = await this.repository.findById(id)
    if (!member) {
      throw new NotFoundError('MiembroEquipo', id)
    }

    if (dto.dni !== undefined) {
      const trimmedDni = dto.dni?.trim() || null
      if (trimmedDni && trimmedDni !== member.dni) {
        const existing = await this.repository.findByDni(trimmedDni)
        if (existing && existing.id !== id) {
          throw new AlreadyExistsError('MiembroEquipo', trimmedDni, 'dni')
        }
      }
    }

    const newTipo = dto.tipo ?? member.tipo
    const emailToUse = (dto.email !== undefined ? dto.email?.trim().toLowerCase() : member.email) || null
    let currentUsuarioId = member.usuarioId

    if (newTipo === 'EQUIPO' || newTipo === 'ESTRATEGIA') {
      const targetRoleName = newTipo === 'EQUIPO' ? 'Equipo' : 'Estrategia'
      const targetRoleId = await this.getOrCreateRole(targetRoleName)

      if (currentUsuarioId) {
        const updateUserData: any = {
          activo: dto.activo !== undefined ? dto.activo : member.activo,
          usuarioRoles: {
            deleteMany: {},
            create: [{ rolId: targetRoleId }],
          },
        }

        if (emailToUse) updateUserData.email = emailToUse
        if (dto.nombre) updateUserData.nombre = dto.nombre.trim()
        if (dto.apellido) updateUserData.apellido = dto.apellido.trim()
        if (dto.contrasena && dto.contrasena.length >= 6) {
          updateUserData.contrasena = await bcrypt.hash(dto.contrasena, 10)
        }

        await this.prisma.usuario.update({
          where: { id: currentUsuarioId },
          data: updateUserData,
        })
      } else if (emailToUse && dto.contrasena && dto.contrasena.length >= 6) {
        // Crear usuario si ahora se proporcionan email y contraseña
        const hashedPassword = await bcrypt.hash(dto.contrasena, 10)
        const username =
          dto.nombreUsuario?.trim().toLowerCase() ||
          (await this.generateUniqueUsername(dto.nombre ?? member.nombre, dto.apellido ?? member.apellido))

        const createdUser = await this.prisma.usuario.create({
          data: {
            email: emailToUse,
            nombreUsuario: username,
            contrasena: hashedPassword,
            nombre: (dto.nombre ?? member.nombre).trim(),
            apellido: (dto.apellido ?? member.apellido).trim(),
            activo: dto.activo !== undefined ? dto.activo : true,
            usuarioRoles: {
              create: [{ rolId: targetRoleId }],
            },
          },
        })
        currentUsuarioId = createdUser.id
        member.setUsuarioId(createdUser.id)
      }
    } else {
      // Degradación a FISCAL o VECINO
      if (currentUsuarioId) {
        await this.prisma.usuario.update({
          where: { id: currentUsuarioId },
          data: { activo: false },
        })
      }
    }

    member.updateInfo({
      nombre: dto.nombre !== undefined ? dto.nombre.trim() : undefined,
      apellido: dto.apellido !== undefined ? dto.apellido.trim() : undefined,
      dni: dto.dni !== undefined ? dto.dni?.trim() || null : undefined,
      telefono: dto.telefono !== undefined ? dto.telefono?.trim() || null : undefined,
      email: emailToUse,
      instagram: dto.instagram !== undefined ? dto.instagram?.trim().replace(/^@/, '') || null : undefined,
      barrioId: dto.barrioId !== undefined ? dto.barrioId : undefined,
      direccion: dto.direccion !== undefined ? dto.direccion?.trim() || null : undefined,
      tipo: newTipo,
      activo: dto.activo !== undefined ? dto.activo : undefined,
      observaciones: dto.observaciones !== undefined ? dto.observaciones?.trim() || null : undefined,
      usuarioId: currentUsuarioId,
    })

    const saved = await this.repository.save(member)
    return toResponseDTO(saved)
  }

  async delete(id: number): Promise<void> {
    const member = await this.repository.findById(id)
    if (!member) {
      throw new NotFoundError('MiembroEquipo', id)
    }

    if (member.usuarioId) {
      await this.prisma.usuario.update({
        where: { id: member.usuarioId },
        data: { activo: false },
      }).catch(() => null)
    }

    await this.repository.delete(id)
  }

  async getById(id: number): Promise<MiembroEquipoResponseDTO> {
    const member = await this.repository.findById(id)
    if (!member) {
      throw new NotFoundError('MiembroEquipo', id)
    }
    return toResponseDTO(member)
  }

  async list(params: FindEquipoParams): Promise<PaginatedResult<MiembroEquipoResponseDTO>> {
    const result = await this.repository.findAll(params)
    return {
      ...result,
      data: result.data.map(toResponseDTO),
    }
  }
}
