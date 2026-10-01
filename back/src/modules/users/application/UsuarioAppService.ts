import * as bcrypt from 'bcryptjs'
import type { PaginationInput, PaginatedResult } from '../../../shared-kernel/Pagination'
import { ConflictError, AlreadyExistsError, NotFoundError } from '../../../shared-kernel/Errors'
import { UserEntity } from '../domain/UserEntity'
import { IUserRepository } from '../domain/IUserRepository'
import { IUsuarioAppService } from './IUsuarioAppService'
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO, toUserResponseDTO } from './UserDTO'

export class UsuarioAppService implements IUsuarioAppService {
  constructor(private readonly userRepository: IUserRepository) {}

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
      try {
        const existing = await this.userRepository.findByEmailOrUsername(candidate)
        if (existing) {
          candidate = `${base}${counter}`
          if (candidate.length > 30) {
            const cutBase = base.slice(0, 30 - String(counter).length)
            candidate = `${cutBase}${counter}`
          }
          counter++
          continue
        }
      } catch (err) {
        if (err instanceof NotFoundError) {
          return candidate
        }
        throw err
      }
    }
  }

  async create(dto: CreateUserDTO): Promise<UserResponseDTO> {
    if (!Array.isArray(dto.rolIds) || dto.rolIds.length === 0) {
      throw new ConflictError('Debés asignar al menos un rol')
    }

    const normalizedEmail = dto.email.trim().toLowerCase()
    let normalizedUsername = dto.nombreUsuario ? dto.nombreUsuario.trim().toLowerCase() : null

    if (!normalizedUsername) {
      normalizedUsername = await this.generateUniqueUsername(dto.nombre, dto.apellido)
    } else {
      try {
        const collision = await this.userRepository.findByEmailOrUsername(normalizedUsername)
        if (collision) {
          const error = new AlreadyExistsError('Usuario', normalizedUsername, 'nombreUsuario')
          error.message = `El nombre de usuario "${normalizedUsername}" ya está en uso`
          throw error
        }
      } catch (err) {
        if (!(err instanceof NotFoundError)) throw err
      }
    }

    try {
      const collision = await this.userRepository.findByEmailOrUsername(normalizedEmail)
      if (collision) {
        const error = new AlreadyExistsError('Usuario', normalizedEmail, 'email')
        error.message = `El email "${normalizedEmail}" ya está registrado`
        throw error
      }
    } catch (err) {
      if (!(err instanceof NotFoundError)) throw err
    }

    const hashedPassword = await bcrypt.hash(dto.contrasena, 10)
    const user = new UserEntity({
      email: normalizedEmail,
      nombreUsuario: normalizedUsername,
      contrasena: hashedPassword,
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
    })
    user.rolIds = dto.rolIds
    await this.userRepository.save(user)
    return toUserResponseDTO(user)
  }

  async update(id: number, dto: UpdateUserDTO): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id)

    const normalizedEmail = dto.email !== undefined ? dto.email.trim().toLowerCase() : undefined

    let normalizedUsername: string | undefined = undefined
    if (dto.nombreUsuario !== undefined) {
      if (dto.nombreUsuario === null || dto.nombreUsuario.trim() === '') {
        throw new ConflictError('El nombre de usuario no puede estar vacío')
      }
      normalizedUsername = dto.nombreUsuario.trim().toLowerCase()
    }

    if (normalizedUsername) {
      try {
        const collision = await this.userRepository.findByEmailOrUsername(normalizedUsername)
        if (collision.id !== id) {
          const error = new AlreadyExistsError('Usuario', normalizedUsername, 'nombreUsuario')
          error.message = `El nombre de usuario "${normalizedUsername}" ya está en uso`
          throw error
        }
      } catch (err) {
        if (!(err instanceof NotFoundError)) throw err
      }
    }

    if (normalizedEmail) {
      try {
        const collision = await this.userRepository.findByEmailOrUsername(normalizedEmail)
        if (collision.id !== id) {
          const error = new AlreadyExistsError('Usuario', normalizedEmail, 'email')
          error.message = `El email "${normalizedEmail}" ya está registrado`
          throw error
        }
      } catch (err) {
        if (!(err instanceof NotFoundError)) throw err
      }
    }

    if (
      normalizedEmail !== undefined ||
      dto.nombre !== undefined ||
      dto.apellido !== undefined ||
      normalizedUsername !== undefined
    ) {
      user.updateInfo({
        email: normalizedEmail,
        nombreUsuario: normalizedUsername,
        nombre: dto.nombre !== undefined ? dto.nombre.trim() : undefined,
        apellido: dto.apellido !== undefined ? dto.apellido.trim() : undefined,
      })
    }
    if (dto.activo !== undefined) {
      user.activo = dto.activo
    }
    if (dto.contrasena !== undefined) {
      const hashed = await bcrypt.hash(dto.contrasena, 10)
      user.setPasswordHash(hashed)
    }
    if (dto.rolIds !== undefined) {
      user.rolIds = dto.rolIds
    }

    await this.userRepository.save(user)
    return toUserResponseDTO(user)
  }

  async getById(id: number): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id)
    return toUserResponseDTO(user)
  }

  async list(params: PaginationInput, search?: string): Promise<PaginatedResult<UserResponseDTO>> {
    const result = await this.userRepository.findAllPaginated(params, search)
    return {
      ...result,
      data: result.data.map(toUserResponseDTO),
    }
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id)
  }
}
