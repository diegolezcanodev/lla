import { LoginDTO, AuthLoginResult, RequestMeta } from './AuthDTO'

export interface IAuthAppService {
  login(dto: LoginDTO, meta?: RequestMeta): Promise<AuthLoginResult>
  logout(meta?: RequestMeta): Promise<void>
}
