import { Router } from 'express'
import { Container } from '../di/container'
import { createAuthRouter } from '../../controllers/AuthController'
import { createUserRouter } from '../../controllers/UserController'
import { createRolesRouter } from '../../controllers/RolesController'
import { createEquipoRouter } from '../../controllers/EquipoController'
import { createBarrioRouter } from '../../controllers/BarrioController'
import { createEmpresaRouter } from '../../controllers/EmpresaController'
import { createStakeholderRouter } from '../../controllers/StakeholderController'
import { createEscuelaRouter } from '../../controllers/EscuelaController'
import { createReclamoRouter } from '../../controllers/ReclamoController'
import { createOposicionRouter } from '../../controllers/OposicionController'
import { createTareaRouter } from '../../controllers/TareaController'
import { createLoginRateLimiter, createLoginIpRateLimiter } from '../middleware/rateLimiter'

export function createRoutes(container: Container): Router {
  const router = Router()

  router.use('/api/auth/login', createLoginIpRateLimiter(), createLoginRateLimiter())
  router.use('/api/auth', createAuthRouter(container.getAuthAppService(), container.getUsuarioAppService()))
  router.use('/api/users', createUserRouter(container.getUsuarioAppService()))
  router.use('/api/roles', createRolesRouter(container.getRolesAppService()))
  router.use('/api/equipo', createEquipoRouter(container.getMiembroEquipoAppService()))
  router.use('/api/barrios', createBarrioRouter(container.getBarrioAppService()))
  router.use('/api/empresas', createEmpresaRouter(container.getEmpresaAppService()))
  router.use('/api/stakeholders', createStakeholderRouter(container.getStakeholderAppService()))
  router.use('/api/escuelas', createEscuelaRouter(container.getEscuelaAppService()))
  router.use('/api/reclamos', createReclamoRouter(container.getReclamoAppService()))

  const { partidosRouter, candidatosRouter } = createOposicionRouter(container.getOposicionAppService())
  router.use('/api/partidos', partidosRouter)
  router.use('/api/candidatos', candidatosRouter)

  router.use('/api/tareas', createTareaRouter(container.getTareaAppService()))

  router.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  return router
}
