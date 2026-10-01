import { UserEntity } from '../domain/UserEntity'

export interface UserResponseDTO {
  id: number
  email: string
  nombreUsuario: string | null
  nombre: string
  apellido: string
  activo: boolean
  roles: string[]
  creadoEn: string
  actualizadoEn: string
}

export interface CreateUserDTO {
  email: string
  nombreUsuario?: string | null
  contrasena: string
  nombre: string
  apellido: string
  rolIds: number[]
}

export interface UpdateUserDTO {
  email?: string
  nombreUsuario?: string | null
  contrasena?: string
  nombre?: string
  apellido?: string
  rolIds?: number[]
  activo?: boolean
}

export function toUserResponseDTO(user: UserEntity): UserResponseDTO {
  return {
    id: user.id,
    email: user.email,
    nombreUsuario: user.nombreUsuario ?? null,
    nombre: user.nombre,
    apellido: user.apellido,
    activo: user.activo,
    roles: user.rolNombres,
    creadoEn: user.creadoEn.toISOString(),
    actualizadoEn: user.actualizadoEn.toISOString(),
  }
}
