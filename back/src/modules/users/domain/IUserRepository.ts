import { UserEntity } from './UserEntity'
import type { PaginationInput, PaginatedResult } from '../../../shared-kernel/Pagination'

export interface IUserRepository {
  save(user: UserEntity): Promise<void>
  findById(id: number): Promise<UserEntity>
  findByEmail(email: string): Promise<UserEntity>
  findByEmailOrUsername(identifier: string): Promise<UserEntity>
  findAllPaginated(params: PaginationInput, search?: string): Promise<PaginatedResult<UserEntity>>
  delete(id: number): Promise<void>
}
