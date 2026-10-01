export abstract class Entity<T, ID = number> {
  protected _id: ID
  protected props: T

  constructor(props: T, id?: ID) {
    this._id = id ?? (0 as unknown as ID)
    this.props = props
  }

  get id(): ID {
    return this._id
  }

  public equals(other: Entity<T, ID>): boolean {
    if (other == null || other.constructor !== this.constructor) return false
    return this._id === other._id
  }
}
