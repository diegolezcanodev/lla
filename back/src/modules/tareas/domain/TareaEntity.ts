import { Entity } from "../../../shared-kernel/Entity"

export type EstadoTarea = "PENDIENTE" | "EN_PROGRESO" | "EN_REVISION" | "COMPLETADA" | "CANCELADA"
export type PrioridadTarea = "BAJA" | "MEDIA" | "ALTA" | "URGENTE"

export interface ComentarioItem {
  id: number
  autor: string
  mensaje: string
  usuarioId?: number | null
  creadoEn: string
}

export interface TareaAsignadoItem {
  id: number
  nombre: string
  apellido: string
}

export interface TareaProps {
  titulo: string
  descripcion?: string | null
  estado?: EstadoTarea
  prioridad?: PrioridadTarea
  asignadosIds?: number[]
  fechaLimite?: Date | null
  barrioId?: number | null
  etiquetas?: string[]
  observaciones?: string | null
}

export class TareaEntity extends Entity<TareaProps> {
  creadoEn: Date
  actualizadoEn: Date
  barrioNombre?: string | null
  asignados: TareaAsignadoItem[] = []
  comentarios: ComentarioItem[] = []

  constructor(props: TareaProps, id?: number) {
    super({ ...props }, id)
    this.props.estado = props.estado || "PENDIENTE"
    this.props.prioridad = props.prioridad || "MEDIA"
    this.props.etiquetas = props.etiquetas || []
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get titulo(): string { return this.props.titulo }
  get descripcion(): string | null | undefined { return this.props.descripcion }
  get estado(): EstadoTarea { return this.props.estado || "PENDIENTE" }
  get prioridad(): PrioridadTarea { return this.props.prioridad || "MEDIA" }
  get asignadosIds(): number[] | undefined { return this.props.asignadosIds }
  get fechaLimite(): Date | null | undefined { return this.props.fechaLimite }
  get barrioId(): number | null | undefined { return this.props.barrioId }
  get etiquetas(): string[] { return this.props.etiquetas || [] }
  get observaciones(): string | null | undefined { return this.props.observaciones }

  updateInfo(data: Partial<TareaProps>): void {
    Object.assign(this.props, data)
    this.actualizadoEn = new Date()
  }
}
