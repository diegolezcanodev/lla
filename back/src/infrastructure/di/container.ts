import { PrismaClient } from '@prisma/client'
import { prisma } from '../prisma/client'
import { AuthAppService } from '../../modules/auth/application/AuthAppService'
import { IAuthAppService } from '../../modules/auth/application/IAuthAppService'
import { UsuarioAppService } from '../../modules/users/application/UsuarioAppService'
import { IUsuarioAppService } from '../../modules/users/application/IUsuarioAppService'
import { RolesAppService } from '../../modules/roles/application/RolesAppService'
import { IRolesAppService } from '../../modules/roles/application/RolesDTO'
import { MiembroEquipoAppService } from '../../modules/equipo/application/MiembroEquipoAppService'
import { IMiembroEquipoAppService } from '../../modules/equipo/application/IMiembroEquipoAppService'
import { BarrioAppService } from '../../modules/barrios/application/BarrioAppService'
import { IBarrioAppService } from '../../modules/barrios/application/IBarrioAppService'
import { UserRepository } from '../repositories/UserRepository'
import { RolRepository } from '../repositories/RolRepository'
import { MiembroEquipoRepository } from '../repositories/MiembroEquipoRepository'
import { BarrioRepository } from '../repositories/BarrioRepository'
import { EmpresaAppService } from '../../modules/empresas/application/EmpresaAppService'
import { IEmpresaAppService } from '../../modules/empresas/application/IEmpresaAppService'
import { EmpresaRepository } from '../repositories/EmpresaRepository'
import { StakeholderAppService } from '../../modules/stakeholders/application/StakeholderAppService'
import { IStakeholderAppService } from '../../modules/stakeholders/application/IStakeholderAppService'
import { StakeholderRepository } from '../repositories/StakeholderRepository'
import { EscuelaAppService } from '../../modules/escuelas/application/EscuelaAppService'
import { IEscuelaAppService } from '../../modules/escuelas/application/IEscuelaAppService'
import { EscuelaRepository } from '../repositories/EscuelaRepository'
import { ReclamoAppService } from '../../modules/reclamos/application/ReclamoAppService'
import { IReclamoAppService } from '../../modules/reclamos/application/IReclamoAppService'
import { ReclamoRepository } from '../repositories/ReclamoRepository'
import { OposicionAppService } from '../../modules/oposicion/application/OposicionAppService'
import { IOposicionAppService } from '../../modules/oposicion/application/IOposicionAppService'
import { PartidoRepository, CandidatoRepository } from '../repositories/OposicionRepository'
import { TareaAppService } from '../../modules/tareas/application/TareaAppService'
import { ITareaAppService } from '../../modules/tareas/application/ITareaAppService'
import { TareaRepository } from '../repositories/TareaRepository'

export class Container {
  private readonly prisma: PrismaClient
  private authAppService?: IAuthAppService
  private usuarioAppService?: IUsuarioAppService
  private rolesAppService?: IRolesAppService
  private miembroEquipoAppService?: IMiembroEquipoAppService
  private barrioAppService?: IBarrioAppService
  private empresaAppService?: IEmpresaAppService
  private stakeholderAppService?: IStakeholderAppService
  private escuelaAppService?: IEscuelaAppService
  private reclamoAppService?: IReclamoAppService
  private oposicionAppService?: IOposicionAppService
  private tareaAppService?: ITareaAppService

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

  getMiembroEquipoAppService(): IMiembroEquipoAppService {
    if (!this.miembroEquipoAppService) {
      const repo = new MiembroEquipoRepository(this.prisma)
      this.miembroEquipoAppService = new MiembroEquipoAppService(repo, this.prisma)
    }
    return this.miembroEquipoAppService
  }

  getBarrioAppService(): IBarrioAppService {
    if (!this.barrioAppService) {
      const repo = new BarrioRepository(this.prisma)
      this.barrioAppService = new BarrioAppService(repo)
    }
    return this.barrioAppService
  }

  getEmpresaAppService(): IEmpresaAppService {
    if (!this.empresaAppService) {
      const repo = new EmpresaRepository(this.prisma)
      this.empresaAppService = new EmpresaAppService(repo)
    }
    return this.empresaAppService
  }

  getStakeholderAppService(): IStakeholderAppService {
    if (!this.stakeholderAppService) {
      const repo = new StakeholderRepository(this.prisma)
      this.stakeholderAppService = new StakeholderAppService(repo)
    }
    return this.stakeholderAppService
  }

  getEscuelaAppService(): IEscuelaAppService {
    if (!this.escuelaAppService) {
      const repo = new EscuelaRepository(this.prisma)
      this.escuelaAppService = new EscuelaAppService(repo)
    }
    return this.escuelaAppService
  }

  getReclamoAppService(): IReclamoAppService {
    if (!this.reclamoAppService) {
      const repo = new ReclamoRepository(this.prisma)
      this.reclamoAppService = new ReclamoAppService(repo)
    }
    return this.reclamoAppService
  }

  getOposicionAppService(): IOposicionAppService {
    if (!this.oposicionAppService) {
      const partidoRepo = new PartidoRepository(this.prisma)
      const candidatoRepo = new CandidatoRepository(this.prisma)
      this.oposicionAppService = new OposicionAppService(partidoRepo, candidatoRepo)
    }
    return this.oposicionAppService
  }

  getTareaAppService(): ITareaAppService {
    if (!this.tareaAppService) {
      const repo = new TareaRepository(this.prisma)
      this.tareaAppService = new TareaAppService(repo)
    }
    return this.tareaAppService
  }
}
