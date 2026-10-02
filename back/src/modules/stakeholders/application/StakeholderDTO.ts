import { TemperaturaRelacion } from "../domain/StakeholderEntity"

export interface CreateStakeholderDTO {
  nombre: string
  apellido: string
  esAliado?: boolean
  fechaUltimoContacto?: string | null
  cargo?: string | null
  organizacion?: string | null
  telefono?: string | null
  email?: string | null
  instagram?: string | null
  barrioId?: number | null
  nivelInfluencia?: number
  observaciones?: string | null
}

export interface UpdateStakeholderDTO {
  nombre?: string
  apellido?: string
  esAliado?: boolean
  fechaUltimoContacto?: string | null
  cargo?: string | null
  organizacion?: string | null
  telefono?: string | null
  email?: string | null
  instagram?: string | null
  barrioId?: number | null
  nivelInfluencia?: number
  observaciones?: string | null
  activo?: boolean
}

export interface StakeholderResponseDTO {
  id: number
  nombre: string
  apellido: string
  esAliado: boolean
  fechaUltimoContacto: string
  temperatura: TemperaturaRelacion
  cargo: string | null
  organizacion: string | null
  telefono: string | null
  email: string | null
  instagram: string | null
  barrioId: number | null
  barrioNombre: string | null
  nivelInfluencia: number
  observaciones: string | null
  activo: boolean
  creadoEn: string
  actualizadoEn: string
}
