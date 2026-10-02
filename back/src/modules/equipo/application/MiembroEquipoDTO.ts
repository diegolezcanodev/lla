import { TipoMiembro } from '../domain/MiembroEquipoEntity'

export interface CreateMiembroEquipoDTO {
  nombre: string
  apellido: string
  dni?: string | null
  telefono?: string | null
  email?: string | null
  instagram?: string | null
  barrioId?: number | null
  direccion?: string | null
  tipo: TipoMiembro
  observaciones?: string | null
  contrasena?: string | null
  nombreUsuario?: string | null
}

export interface UpdateMiembroEquipoDTO {
  nombre?: string
  apellido?: string
  dni?: string | null
  telefono?: string | null
  email?: string | null
  instagram?: string | null
  barrioId?: number | null
  direccion?: string | null
  tipo?: TipoMiembro
  activo?: boolean
  observaciones?: string | null
  contrasena?: string | null
  nombreUsuario?: string | null
}

export interface MiembroEquipoResponseDTO {
  id: number
  nombre: string
  apellido: string
  dni: string | null
  telefono: string | null
  email: string | null
  instagram: string | null
  barrioId: number | null
  barrioNombre: string | null
  direccion: string | null
  tipo: TipoMiembro
  activo: boolean
  observaciones: string | null
  usuarioId: number | null
  usuarioEmail: string | null
  creadoEn: string
  actualizadoEn: string
}
