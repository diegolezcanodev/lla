import * as bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../../../config'
import { NotFoundError, UnauthorizedError } from '../../../shared-kernel/Errors'
import { IUserRepository } from '../../users/domain/IUserRepository'
import { UserEntity } from '../../users/domain/UserEntity'
import { appLog } from '../../../infrastructure/logger/logger'
import { IAuthAppService } from './IAuthAppService'
import { LoginDTO, AuthLoginResult, RequestMeta, toAuthResponseDTO } from './AuthDTO'

export class AuthAppService implements IAuthAppService {
  constructor(private readonly userRepository: IUserRepository) {}

  async login(dto: LoginDTO, meta?: RequestMeta): Promise<AuthLoginResult> {
    const identifier = (dto.login || dto.email || '').trim()
    let user: UserEntity
    try {
      user = await this.userRepository.findByEmailOrUsername(identifier)
    } catch (err) {
      if (err instanceof NotFoundError) {
        appLog.warn('Intento de login con usuario o email inexistente', { identifier, ...meta })
        throw new UnauthorizedError('Credenciales inválidas')
      }
      throw err
    }

    if (!user.activo) {
      appLog.warn('Intento de login en cuenta inactiva', { userId: user.id, identifier, ...meta })
      throw new UnauthorizedError('Credenciales inválidas')
    }

    const valid = await bcrypt.compare(dto.password, user.contrasena)
    if (!valid) {
      appLog.warn('Login fallido por contraseña incorrecta', { userId: user.id, identifier, ...meta })
      throw new UnauthorizedError('Credenciales inválidas')
    }

    const token = this.signAccessToken(user)
    appLog.info('Login exitoso', { userId: user.id, email: user.email, ...meta })
    return toAuthResponseDTO(token, user)
  }

  async logout(_meta?: RequestMeta): Promise<void> {
    appLog.info('Logout')
  }

  private signAccessToken(user: UserEntity): string {
    return jwt.sign(
      { userId: user.id, email: user.email, roles: user.rolNombres },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions,
    )
  }
}
