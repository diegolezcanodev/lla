import { RolEntity } from './RolEntity'

export interface IRolRepository {
  findAll(): Promise<RolEntity[]>
}
