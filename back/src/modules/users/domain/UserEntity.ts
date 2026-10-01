import { Entity } from '../../../shared-kernel/Entity'

export class UserEntity extends Entity<{
  email: string
  nombreUsuario?: string | null
  contrasena: string
  nombre: string
  apellido: string
}> {
  creadoEn: Date
  actualizadoEn: Date
  activo: boolean = true
  rolIds: number[] = []
  rolNombres: string[] = []

  constructor(
    props: {
      email: string
      nombreUsuario?: string | null
      contrasena: string
      nombre: string
      apellido: string
    },
    id?: number,
  ) {
    super({ ...props }, id)
    this.creadoEn = new Date()
    this.actualizadoEn = new Date()
  }

  get email(): string {
    return this.props.email
  }
  get nombreUsuario(): string | null | undefined {
    return this.props.nombreUsuario
  }
  get contrasena(): string {
    return this.props.contrasena
  }
  get nombre(): string {
    return this.props.nombre
  }
  get apellido(): string {
    return this.props.apellido
  }

  updateInfo(data: {
    email?: string
    nombre?: string
    apellido?: string
    nombreUsuario?: string | null
  }): void {
    if (data.email !== undefined) this.props.email = data.email
    if (data.nombreUsuario !== undefined) this.props.nombreUsuario = data.nombreUsuario
    if (data.nombre !== undefined) this.props.nombre = data.nombre
    if (data.apellido !== undefined) this.props.apellido = data.apellido
    this.actualizadoEn = new Date()
  }

  setPasswordHash(hash: string): void {
    this.props.contrasena = hash
    this.actualizadoEn = new Date()
  }

  setRoles(rolIds: number[], rolNombres: string[]): void {
    this.rolIds = rolIds
    this.rolNombres = rolNombres
  }
}
