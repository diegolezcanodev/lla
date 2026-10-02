import { Entity } from "../../../shared-kernel/Entity"

export type TemperaturaRelacion = "ALIADO" | "CALIENTE" | "TIBIA" | "FRIA" | "DISTANTE" | "PERDIDO"

export interface StakeholderProps {
  nombre: string
  apellido: string
  esAliado?: boolean
  fechaUltimoContacto?: Date
  cargo?: string | null
  organizacion?: string | null
  telefono?: string | null
  email?: string | null
  instagram?: string | null
  barrioId?: number | null
  nivelInfluencia?: number
  observaciones?: string | null
  activo?: boolean
}

export class StakeholderEntity extends Entity<StakeholderProps> {
  creadoEn: Date
  actualizadoEn: Date
  activo: boolean = true
  barrioNombre?: string | null

  constructor(props: StakeholderProps, id?: number) {
    super({ ...props }, id)
    this.activo = props.activo !== undefined ? props.activo : true
    this.props.esAliado = props.esAliado || false
    this.props.fechaUltimoContacto = props.fechaUltimoContacto || new Date()
    this.props.nivelInfluencia = props.nivelInfluencia !== undefined ? props.nivelInfluencia : 5
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get nombre(): string { return this.props.nombre }
  get apellido(): string { return this.props.apellido }
  get esAliado(): boolean { return !!this.props.esAliado }
  get fechaUltimoContacto(): Date { return this.props.fechaUltimoContacto || new Date() }
  get cargo(): string | null | undefined { return this.props.cargo }
  get organizacion(): string | null | undefined { return this.props.organizacion }
  get telefono(): string | null | undefined { return this.props.telefono }
  get email(): string | null | undefined { return this.props.email }
  get instagram(): string | null | undefined { return this.props.instagram }
  get barrioId(): number | null | undefined { return this.props.barrioId }
  get nivelInfluencia(): number { return this.props.nivelInfluencia ?? 5 }
  get observaciones(): string | null | undefined { return this.props.observaciones }

  get temperatura(): TemperaturaRelacion {
    if (this.esAliado) return "ALIADO"
    const hoy = new Date()
    const diffTime = hoy.getTime() - new Date(this.fechaUltimoContacto).getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 5) return "CALIENTE"
    if (diffDays <= 10) return "TIBIA"
    if (diffDays <= 20) return "FRIA"
    if (diffDays <= 60) return "DISTANTE"
    return "PERDIDO"
  }

  registrarContacto(fecha: Date = new Date()): void {
    this.props.fechaUltimoContacto = fecha
    this.actualizadoEn = new Date()
  }

  updateInfo(data: Partial<StakeholderProps>): void {
    Object.assign(this.props, data)
    if (data.activo !== undefined) this.activo = data.activo
    this.actualizadoEn = new Date()
  }
}
