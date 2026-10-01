import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../config'
import { runWithContext, AppContext } from '../../shared-kernel/AppContext'

const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/logout', '/api/health']

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (PUBLIC_PATHS.includes(req.path)) {
    return next()
  }

  const token = req.signedCookies[config.cookie.name]
  if (!token) {
    res.status(401).json({ error: 'Token requerido' })
    return
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as { userId: number; email: string; roles: string[] }

    const context: AppContext = {
      userId: String(payload.userId),
      roles: payload.roles,
    }

    runWithContext(context, () => next())
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
