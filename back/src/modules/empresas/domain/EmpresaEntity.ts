import { Entity } from "../../../shared-kernel/Entity"

export type TamanoEmpresa = "MICRO" | "PEQUENA" | "MEDIANA" | "GRANDE"

export interface EmpresaProps {
  nombre: string
  direccion: string
  barrioId: number
  rubro?: string | null
  tamano?: TamanoEmpresa | null
  cuit?: string | null
  telefono?: string | null
  email?: string | null
  contactoPrincipal?: string | null
  observaciones?: string | null
  activa?: boolean
}

export class EmpresaEntity extends Entity<EmpresaProps> {
  creadoEn: Date
  actualizadoEn: Date
  activa: boolean = true
  barrioNombre?: string | null

  constructor(props: EmpresaProps, id?: number) {
    super({ ...props }, id)
    this.activa = props.activa !== undefined ? props.activa : true
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get nombre(): string { return this.props.nombre }
  get direccion(): string { return this.props.direccion }
  get barrioId(): number { return this.props.barrioId }
  get rubro(): string | null | undefined { return this.props.rubro }
  get tamano(): TamanoEmpresa | null | undefined { return this.props.tamano }
  get cuit(): string | null | undefined { return this.props.cuit }
  get telefono(): string | null | undefined { return this.props.telefono }
  get email(): string | null | undefined { return this.props.email }
  get contactoPrincipal(): string | null | undefined { return this.props.contactoPrincipal }
  get observaciones(): string | null | undefined { return this.props.observaciones }

  updateInfo(data: Partial<EmpresaProps>): void {
    Object.assign(this.props, data)
    if (data.activa !== undefined) this.activa = data.activa
    this.actualizadoEn = new Date()
  }
}
