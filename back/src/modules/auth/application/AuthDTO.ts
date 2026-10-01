import { UserEntity } from '../../users/domain/UserEntity'
import { UserResponseDTO, toUserResponseDTO } from '../../users/application/UserDTO'

export interface LoginDTO {
  login?: string
  email?: string
  password: string
}

export interface RequestMeta {
  ip: string
  userAgent: string
}

export interface AuthLoginResult {
  token: string
  user: UserResponseDTO
}

export function toAuthResponseDTO(token: string, user: UserEntity): AuthLoginResult {
  return { token, user: toUserResponseDTO(user) }
}
