import { Router, Request, Response } from 'express'
import { safeParse, flatten, InferOutput } from 'valibot'
import { config } from '../config'
import { IAuthAppService } from '../modules/auth/application/IAuthAppService'
import { IUsuarioAppService } from '../modules/users/application/IUsuarioAppService'
import { sendError, sendValidationError } from './helpers'
import { getAppContext } from '../shared-kernel/AppContext'
import { loginSchema } from '../lib/validation'

function validateLogin(req: Request, res: Response): InferOutput<typeof loginSchema> | void {
  const parsed = safeParse(loginSchema, req.body)
  if (!parsed.success) {
    sendValidationError(res, flatten(parsed.issues))
    return
  }
  return parsed.output
}

function requestMeta(req: Request): { ip: string; userAgent: string } {
  return {
    ip: req.ip ?? '',
    userAgent: req.get('User-Agent') ?? '',
  }
}

class AuthController {
  constructor(
    private readonly authService: IAuthAppService,
    private readonly userService: IUsuarioAppService,
  ) {}

  private setAccessCookie(res: Response, token: string): void {
    res.cookie(config.cookie.name, token, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      path: config.cookie.path,
      maxAge: config.cookie.maxAge,
      signed: true,
    })
  }

  private clearCookies(res: Response): void {
    res.clearCookie(config.cookie.name, { path: config.cookie.path })
  }

  login = async (req: Request, res: Response): Promise<void> => {
    const data = validateLogin(req, res)
    if (!data) return

    try {
      const result = await this.authService.login(data, requestMeta(req))
      this.setAccessCookie(res, result.token)
      res.json({ user: result.user })
    } catch (err) {
      sendError(res, err)
    }
  }

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authService.logout(requestMeta(req))
      this.clearCookies(res)
      res.json({ message: 'Sesión cerrada' })
    } catch (err) {
      sendError(res, err)
    }
  }

  me = async (_req: Request, res: Response): Promise<void> => {
    const ctx = getAppContext()
    if (!ctx) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }
    try {
      const user = await this.userService.getById(Number(ctx.userId))
      res.json({ user })
    } catch (err) {
      sendError(res, err)
    }
  }
}

export function createAuthRouter(
  authService: IAuthAppService,
  userService: IUsuarioAppService,
): Router {
  const ctrl = new AuthController(authService, userService)
  const router = Router()

  router.post('/login', ctrl.login)
  router.post('/logout', ctrl.logout)
  router.get('/me', ctrl.me)

  return router
}
