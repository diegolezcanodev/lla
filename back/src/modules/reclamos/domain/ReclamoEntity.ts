import { Entity } from "../../../shared-kernel/Entity"

export type CategoriaReclamo = "ALUMBRADO" | "PAVIMENTO" | "AGUA" | "CLOACAS" | "LIMPIEZA" | "SEGURIDAD" | "TRANSPORTE" | "SALUD" | "OTRO"
export type EstadoReclamo = "PENDIENTE" | "EN_PROCESO" | "RESUELTO" | "RECHAZADO"
export type PrioridadReclamo = "ALTA" | "MEDIA" | "BAJA"

export interface ReclamoProps {
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

export class ReclamoEntity extends Entity<ReclamoProps> {
  creadoEn: Date
  actualizadoEn: Date
  barrioNombre?: string | null
  asignadoANombre?: string | null

  constructor(props: ReclamoProps, id?: number) {
    super({ ...props }, id)
    this.props.categoria = props.categoria || "OTRO"
    this.props.estado = props.estado || "PENDIENTE"
    this.props.prioridad = props.prioridad || "MEDIA"
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get vecino(): string { return this.props.vecino }
  get titulo(): string { return this.props.titulo }
  get descripcion(): string { return this.props.descripcion }
  get dni(): string | null | undefined { return this.props.dni }
  get telefono(): string | null | undefined { return this.props.telefono }
  get barrioId(): number | null | undefined { return this.props.barrioId }
  get direccion(): string | null | undefined { return this.props.direccion }
  get categoria(): CategoriaReclamo { return this.props.categoria || "OTRO" }
  get estado(): EstadoReclamo { return this.props.estado || "PENDIENTE" }
  get prioridad(): PrioridadReclamo { return this.props.prioridad || "MEDIA" }
  get respuesta(): string | null | undefined { return this.props.respuesta }
  get asignadoAId(): number | null | undefined { return this.props.asignadoAId }
  get observaciones(): string | null | undefined { return this.props.observaciones }

  updateInfo(data: Partial<ReclamoProps>): void {
    Object.assign(this.props, data)
    this.actualizadoEn = new Date()
  }
}
