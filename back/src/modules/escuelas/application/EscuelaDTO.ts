import { NivelEducativo } from "../domain/EscuelaEntity"

export interface CreateEscuelaDTO {
  nombre: string
  nivel: NivelEducativo
  numero?: number | null
  modalidad?: string | null
  direccion?: string | null
  barrioId?: number | null
  director?: string | null
  telefonoDirector?: string | null
  emailDirector?: string | null
  observaciones?: string | null
}

export interface UpdateEscuelaDTO {
  nombre?: string
  nivel?: NivelEducativo
  numero?: number | null
  modalidad?: string | null
  direccion?: string | null
  barrioId?: number | null
  director?: string | null
  telefonoDirector?: string | null
  emailDirector?: string | null
  observaciones?: string | null
  activa?: boolean
}

export interface EscuelaResponseDTO {
  id: number
  nombre: string
  nivel: NivelEducativo
  numero: number | null
  modalidad: string | null
  direccion: string | null
  barrioId: number | null
  barrioNombre: string | null
  director: string | null
  telefonoDirector: string | null
  emailDirector: string | null
  observaciones: string | null
  activa: boolean
  creadoEn: string
  actualizadoEn: string
}
