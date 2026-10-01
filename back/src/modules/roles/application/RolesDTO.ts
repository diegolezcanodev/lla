import { RolEntity } from '../domain/RolEntity'

export interface RolResponseDTO {
  id: number
  nombre: string
}

export function toRolResponseDTO(rol: RolEntity): RolResponseDTO {
  return { id: rol.id, nombre: rol.nombre }
}

export interface IRolesAppService {
  list(): Promise<RolResponseDTO[]>
}
