import { EstadoTarea, PrioridadTarea, ComentarioItem } from "../domain/TareaEntity"

export interface TareaAsignadoDTO {
  id: number
  nombre: string
  apellido: string
}

export interface CreateTareaDTO {
  titulo: string
  descripcion?: string | null
  estado?: EstadoTarea
  prioridad?: PrioridadTarea
  asignadosIds?: number[]
  fechaLimite?: string | null
  barrioId?: number | null
  etiquetas?: string[]
  observaciones?: string | null
}

export interface UpdateTareaDTO {
  titulo?: string
  descripcion?: string | null
  estado?: EstadoTarea
  prioridad?: PrioridadTarea
  asignadosIds?: number[]
  fechaLimite?: string | null
  barrioId?: number | null
  etiquetas?: string[]
  observaciones?: string | null
}

export interface TareaResponseDTO {
  id: number
  titulo: string
  descripcion: string | null
  estado: EstadoTarea
  prioridad: PrioridadTarea
  asignados: TareaAsignadoDTO[]
  fechaLimite: string | null
  barrioId: number | null
  barrioNombre: string | null
  etiquetas: string[]
  observaciones: string | null
  comentarios: ComentarioItem[]
  creadoEn: string
  actualizadoEn: string
}
