import { Entity } from "../../../shared-kernel/Entity"

export interface PartidoProps {
  nombre: string
  sigla?: string | null
  color?: string | null
  referenteNombre?: string | null
  observaciones?: string | null
  activo?: boolean
}

export class PartidoEntity extends Entity<PartidoProps> {
  creadoEn: Date
  actualizadoEn: Date
  activo: boolean = true
  candidatosCount: number = 0

  constructor(props: PartidoProps, id?: number) {
    super({ ...props }, id)
    this.activo = props.activo !== undefined ? props.activo : true
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get nombre(): string { return this.props.nombre }
  get sigla(): string | null | undefined { return this.props.sigla }
  get color(): string | null | undefined { return this.props.color }
  get referenteNombre(): string | null | undefined { return this.props.referenteNombre }
  get observaciones(): string | null | undefined { return this.props.observaciones }

  updateInfo(data: Partial<PartidoProps>): void {
    Object.assign(this.props, data)
    if (data.activo !== undefined) this.activo = data.activo
    this.actualizadoEn = new Date()
  }
}
