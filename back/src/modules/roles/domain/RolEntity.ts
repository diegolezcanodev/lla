import { Entity } from '../../../shared-kernel/Entity'

export class RolEntity extends Entity<{ nombre: string }> {
  constructor(props: { nombre: string }, id?: number) {
    super({ ...props }, id)
  }

  get nombre(): string {
    return this.props.nombre
  }
}
