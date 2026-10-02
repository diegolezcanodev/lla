import { Entity } from "../../../shared-kernel/Entity"

export type NivelAmenaza = "BAJO" | "MEDIO" | "ALTO" | "CRITICO"

export interface CandidatoProps {
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
  activo?: boolean
}

export class CandidatoEntity extends Entity<CandidatoProps> {
  creadoEn: Date
  actualizadoEn: Date
  activo: boolean = true
  partidoNombre?: string | null
  partidoColor?: string | null

  constructor(props: CandidatoProps, id?: number) {
    super({ ...props }, id)
    this.activo = props.activo !== undefined ? props.activo : true
    this.props.nivelAmenaza = props.nivelAmenaza || "BAJO"
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get nombre(): string { return this.props.nombre }
  get apellido(): string { return this.props.apellido }
  get partidoId(): number | null | undefined { return this.props.partidoId }
  get cargo(): string | null | undefined { return this.props.cargo }
  get telefono(): string | null | undefined { return this.props.telefono }
  get email(): string | null | undefined { return this.props.email }
  get instagram(): string | null | undefined { return this.props.instagram }
  get fortalezas(): string | null | undefined { return this.props.fortalezas }
  get debilidades(): string | null | undefined { return this.props.debilidades }
  get infoEstrategica(): string | null | undefined { return this.props.infoEstrategica }
  get nivelAmenaza(): NivelAmenaza { return this.props.nivelAmenaza || "BAJO" }
  get observaciones(): string | null | undefined { return this.props.observaciones }

  updateInfo(data: Partial<CandidatoProps>): void {
    Object.assign(this.props, data)
    if (data.activo !== undefined) this.activo = data.activo
    this.actualizadoEn = new Date()
  }
}
