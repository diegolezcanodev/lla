export type NivelAmenaza = "BAJO" | "MEDIO" | "ALTO" | "CRITICO"

export interface PartidoResponseDTO {
  id: number
  nombre: string
  sigla: string | null
  color: string | null
  referenteNombre: string | null
  observaciones: string | null
  activo: boolean
  candidatosCount: number
  creadoEn: string
  actualizadoEn: string
}

export interface CreatePartidoDTO {
  nombre: string
  sigla?: string | null
  color?: string | null
  referenteNombre?: string | null
  observaciones?: string | null
}

export interface UpdatePartidoDTO {
  nombre?: string
  sigla?: string | null
  color?: string | null
  referenteNombre?: string | null
  observaciones?: string | null
  activo?: boolean
}

export interface CandidatoResponseDTO {
  id: number
  nombre: string
  apellido: string
  partidoId: number | null
  partidoNombre: string | null
  partidoColor: string | null
  cargo: string | null
  telefono: string | null
  email: string | null
  instagram: string | null
  fortalezas: string | null
  debilidades: string | null
  infoEstrategica: string | null
  nivelAmenaza: NivelAmenaza
  observaciones: string | null
  activo: boolean
  creadoEn: string
  actualizadoEn: string
}

export interface CreateCandidatoDTO {
  nombre: string
  apellido: string
  partidoId?: number | null
  cargo?: string | null
  telefono?: string | null
  email?: string | null
  instagram?: string | null
  fortalezas?: string | null
  debilidades?: string | null
  infoEstrategica?: string | null
  nivelAmenaza?: NivelAmenaza
  observaciones?: string | null
}

export interface UpdateCandidatoDTO {
  nombre?: string
  apellido?: string
  partidoId?: number | null
  cargo?: string | null
  telefono?: string | null
  email?: string | null
  instagram?: string | null
  fortalezas?: string | null
  debilidades?: string | null
  infoEstrategica?: string | null
  nivelAmenaza?: NivelAmenaza
  observaciones?: string | null
  activo?: boolean
}
