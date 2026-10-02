import { Entity } from "../../../shared-kernel/Entity"

export type NivelEducativo = "INICIAL" | "PRIMARIA" | "SECUNDARIA" | "TERCIARIA" | "UNIVERSITARIA" | "ESPECIAL"

export interface EscuelaProps {
  nombre: string
  nivel: NivelEducativo
  numero?: number | null
  modalidad?: string | null
  direccion?: string | null
  barrioId?: number | null
  director?: string | null
  telefonoDirector?: string | null
  emailDirector?: string | null
  observaciones?: string | null
  activa?: boolean
}

export class EscuelaEntity extends Entity<EscuelaProps> {
  creadoEn: Date
  actualizadoEn: Date
  activa: boolean = true
  barrioNombre?: string | null

  constructor(props: EscuelaProps, id?: number) {
    super({ ...props }, id)
    this.activa = props.activa !== undefined ? props.activa : true
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get nombre(): string { return this.props.nombre }
  get nivel(): NivelEducativo { return this.props.nivel }
  get numero(): number | null | undefined { return this.props.numero }
  get modalidad(): string | null | undefined { return this.props.modalidad }
  get direccion(): string | null | undefined { return this.props.direccion }
  get barrioId(): number | null | undefined { return this.props.barrioId }
  get director(): string | null | undefined { return this.props.director }
  get telefonoDirector(): string | null | undefined { return this.props.telefonoDirector }
  get emailDirector(): string | null | undefined { return this.props.emailDirector }
  get observaciones(): string | null | undefined { return this.props.observaciones }

  updateInfo(data: Partial<EscuelaProps>): void {
    Object.assign(this.props, data)
    if (data.activa !== undefined) this.activa = data.activa
    this.actualizadoEn = new Date()
  }
}
