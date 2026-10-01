import { Router } from 'express'
import { Container } from '../di/container'
import { createAuthRouter } from '../../controllers/AuthController'
import { createUserRouter } from '../../controllers/UserController'
import { createRolesRouter } from '../../controllers/RolesController'
import { createLoginRateLimiter, createLoginIpRateLimiter } from '../middleware/rateLimiter'

export function createRoutes(container: Container): Router {
  const router = Router()

  router.use('/api/auth/login', createLoginIpRateLimiter(), createLoginRateLimiter())
  router.use('/api/auth', createAuthRouter(container.getAuthAppService(), container.getUsuarioAppService()))
  router.use('/api/users', createUserRouter(container.getUsuarioAppService()))
  router.use('/api/roles', createRolesRouter(container.getRolesAppService()))

  router.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  return router
}
