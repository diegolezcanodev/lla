import { PrismaClient } from '@prisma/client'
import { prisma } from '../prisma/client'
import { AuthAppService } from '../../modules/auth/application/AuthAppService'
import { IAuthAppService } from '../../modules/auth/application/IAuthAppService'
import { UsuarioAppService } from '../../modules/users/application/UsuarioAppService'
import { IUsuarioAppService } from '../../modules/users/application/IUsuarioAppService'
import { RolesAppService } from '../../modules/roles/application/RolesAppService'
import { IRolesAppService } from '../../modules/roles/application/RolesDTO'
import { UserRepository } from '../repositories/UserRepository'
import { RolRepository } from '../repositories/RolRepository'

export class Container {
  private readonly prisma: PrismaClient
  private authAppService?: IAuthAppService
  private usuarioAppService?: IUsuarioAppService
  private rolesAppService?: IRolesAppService

  constructor() {
    this.prisma = prisma
  }

  getAuthAppService(): IAuthAppService {
    if (!this.authAppService) {
      const userRepo = new UserRepository(this.prisma)
      this.authAppService = new AuthAppService(userRepo)
    }
    return this.authAppService
  }

  getUsuarioAppService(): IUsuarioAppService {
    if (!this.usuarioAppService) {
      const userRepo = new UserRepository(this.prisma)
      this.usuarioAppService = new UsuarioAppService(userRepo)
    }
    return this.usuarioAppService
  }

  getRolesAppService(): IRolesAppService {
    if (!this.rolesAppService) {
      const rolRepo = new RolRepository(this.prisma)
      this.rolesAppService = new RolesAppService(rolRepo)
    }
    return this.rolesAppService
  }
}
