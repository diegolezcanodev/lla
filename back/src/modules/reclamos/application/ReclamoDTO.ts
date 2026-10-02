import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "../domain/ReclamoEntity"

export interface CreateReclamoDTO {
  vecino: string
  titulo: string
  descripcion: string
  dni?: string | null
  telefono?: string | null
  barrioId?: number | null
  direccion?: string | null
  categoria?: CategoriaReclamo
  estado?: EstadoReclamo
  prioridad?: PrioridadReclamo
  respuesta?: string | null
  asignadoAId?: number | null
  observaciones?: string | null
}

export interface UpdateReclamoDTO {
  vecino?: string
  titulo?: string
  descripcion?: string
  dni?: string | null
  telefono?: string | null
  barrioId?: number | null
  direccion?: string | null
  categoria?: CategoriaReclamo
  estado?: EstadoReclamo
  prioridad?: PrioridadReclamo
  respuesta?: string | null
  asignadoAId?: number | null
  observaciones?: string | null
}

export interface ReclamoResponseDTO {
  id: number
  vecino: string
  titulo: string
  descripcion: string
  dni: string | null
  telefono: string | null
  barrioId: number | null
  barrioNombre: string | null
  direccion: string | null
  categoria: CategoriaReclamo
  estado: EstadoReclamo
  prioridad: PrioridadReclamo
  respuesta: string | null
  asignadoAId: number | null
  asignadoANombre: string | null
  observaciones: string | null
  creadoEn: string
  actualizadoEn: string
}
