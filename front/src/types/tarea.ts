export type EstadoTarea = "PENDIENTE" | "EN_PROGRESO" | "EN_REVISION" | "COMPLETADA" | "CANCELADA"
export type PrioridadTarea = "BAJA" | "MEDIA" | "ALTA" | "URGENTE"

export interface ComentarioItem {
  id: number
  autor: string
  mensaje: string
  usuarioId: number | null
  creadoEn: string
}

export interface TareaAsignadoDTO {
  id: number
  nombre: string
  apellido: string
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

export interface CreateComentarioDTO {
  autor: string
  mensaje: string
}
