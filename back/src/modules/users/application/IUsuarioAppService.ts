import type { PaginationInput, PaginatedResult } from '../../../shared-kernel/Pagination'
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from './UserDTO'

export interface IUsuarioAppService {
  create(dto: CreateUserDTO): Promise<UserResponseDTO>
  update(id: number, dto: UpdateUserDTO): Promise<UserResponseDTO>
  getById(id: number): Promise<UserResponseDTO>
  list(params: PaginationInput, search?: string): Promise<PaginatedResult<UserResponseDTO>>
  delete(id: number): Promise<void>
}
