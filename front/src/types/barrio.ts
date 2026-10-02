export type PrioridadBarrio = 'ALTA' | 'MEDIA' | 'BAJA' | 'EN_DISPUTA'

export interface BarrioResponseDTO {
  id: number
  nombre: string
  codigo: string | null
  color: string | null
  prioridad: PrioridadBarrio
  descripcion: string | null
  observaciones: string | null
  tags: string[]
  activo: boolean
  creadoEn: string
  actualizadoEn: string
}

export interface CreateBarrioDTO {
  nombre: string
  codigo?: string | null
  color?: string | null
  prioridad?: PrioridadBarrio
  descripcion?: string | null
  observaciones?: string | null
  tags?: string[]
}

export interface UpdateBarrioDTO {
  nombre?: string
  codigo?: string | null
  color?: string | null
  prioridad?: PrioridadBarrio
  descripcion?: string | null
  observaciones?: string | null
  tags?: string[]
  activo?: boolean
}
