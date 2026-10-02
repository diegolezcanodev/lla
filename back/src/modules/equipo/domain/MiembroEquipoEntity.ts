import { Entity } from '../../../shared-kernel/Entity'

export type TipoMiembro = 'EQUIPO' | 'ESTRATEGIA' | 'FISCAL' | 'VECINO'

export interface MiembroEquipoProps {
  nombre: string
  apellido: string
  dni?: string | null
  telefono?: string | null
  email?: string | null
  instagram?: string | null
  barrioId?: number | null
  direccion?: string | null
  tipo: TipoMiembro
  activo?: boolean
  observaciones?: string | null
  usuarioId?: number | null
}

export class MiembroEquipoEntity extends Entity<MiembroEquipoProps> {
  creadoEn: Date
  actualizadoEn: Date
  activo: boolean = true
  usuarioEmail?: string | null
  usuarioRoles: string[] = []
  barrioNombre?: string | null

  constructor(props: MiembroEquipoProps, id?: number) {
    super({ ...props }, id)
    this.activo = props.activo !== undefined ? props.activo : true
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get nombre(): string {
    return this.props.nombre
  }
  get apellido(): string {
    return this.props.apellido
  }
  get dni(): string | null | undefined {
    return this.props.dni
  }
  get telefono(): string | null | undefined {
    return this.props.telefono
  }
  get email(): string | null | undefined {
    return this.props.email
  }
  get instagram(): string | null | undefined {
    return this.props.instagram
  }
  get barrioId(): number | null | undefined {
    return this.props.barrioId
  }
  get direccion(): string | null | undefined {
    return this.props.direccion
  }
  get tipo(): TipoMiembro {
    return this.props.tipo
  }
  get observaciones(): string | null | undefined {
    return this.props.observaciones
  }
  get usuarioId(): number | null | undefined {
    return this.props.usuarioId
  }

  setUsuarioId(usuarioId: number | null): void {
    this.props.usuarioId = usuarioId
    this.actualizadoEn = new Date()
  }

  updateInfo(data: Partial<MiembroEquipoProps>): void {
    Object.assign(this.props, data)
    if (data.activo !== undefined) {
      this.activo = data.activo
    }
    this.actualizadoEn = new Date()
  }
}
