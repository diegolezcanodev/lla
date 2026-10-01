import { Request, Response, NextFunction } from 'express'
import { getAppContext } from '../../shared-kernel/AppContext'

export function authorize(...roles: string[]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const context = getAppContext()

    if (!context) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }

    if (roles.length > 0) {
      const hasAccess = roles.some((r) => context.roles.includes(r))
      if (!hasAccess) {
        res.status(403).json({ error: 'Acceso denegado' })
        return
      }
    }

    next()
  }
}
