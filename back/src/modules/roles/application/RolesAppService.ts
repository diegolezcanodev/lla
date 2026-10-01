import { IRolesAppService, RolResponseDTO, toRolResponseDTO } from './RolesDTO'
import { IRolRepository } from '../domain/IRolRepository'

export class RolesAppService implements IRolesAppService {
  constructor(private readonly rolRepository: IRolRepository) {}

  async list(): Promise<RolResponseDTO[]> {
    const roles = await this.rolRepository.findAll()
    return roles.map(toRolResponseDTO)
  }
}
