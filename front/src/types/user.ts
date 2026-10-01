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
