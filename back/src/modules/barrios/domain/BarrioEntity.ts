import { Entity } from '../../../shared-kernel/Entity'

export type PrioridadBarrio = 'ALTA' | 'MEDIA' | 'BAJA' | 'EN_DISPUTA'

export interface BarrioProps {
  nombre: string
  codigo?: string | null
  color?: string | null
  prioridad?: PrioridadBarrio
  descripcion?: string | null
  observaciones?: string | null
  tags?: string[]
  activo?: boolean
}

export class BarrioEntity extends Entity<BarrioProps> {
  creadoEn: Date
  actualizadoEn: Date
  activo: boolean = true

  constructor(props: BarrioProps, id?: number) {
    super({ ...props }, id)
    this.activo = props.activo !== undefined ? props.activo : true
    this.props.prioridad = props.prioridad || 'MEDIA'
    this.props.tags = props.tags || []
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get nombre(): string {
    return this.props.nombre
  }
  get codigo(): string | null | undefined {
    return this.props.codigo
  }
  get color(): string | null | undefined {
    return this.props.color
  }
  get prioridad(): PrioridadBarrio {
    return this.props.prioridad || 'MEDIA'
  }
  get descripcion(): string | null | undefined {
    return this.props.descripcion
  }
  get observaciones(): string | null | undefined {
    return this.props.observaciones
  }
  get tags(): string[] {
    return this.props.tags || []
  }

  updateInfo(data: Partial<BarrioProps>): void {
    Object.assign(this.props, data)
    if (data.activo !== undefined) this.activo = data.activo
    this.actualizadoEn = new Date()
  }
}
