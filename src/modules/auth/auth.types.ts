import type { UserEntity } from '../../models'
import type { I_FastifyRequest } from '../../common/interfaces'
import type { SingleUseJwtEnum } from './auth.service'
import { CURRENT_USER_KEY } from './guards/constants'

export type T_JwtPayload = {
  userId: UserEntity['id']
  logToken: string
}
type T_VerifyPayload = {
  userId: UserEntity['id']
  logToken: string
  emailRedirect: string
}
type T_ForgotPayload = {
  userId: UserEntity['id']
  hash: string
}
export type T_SingleUsePayload<T extends SingleUseJwtEnum> = T extends SingleUseJwtEnum.VERIFY_EMAIL
  ? T_VerifyPayload
  : T extends SingleUseJwtEnum
  ? T_ForgotPayload
  : never
export interface I_AuthorizedFastifyRequest extends I_FastifyRequest {
  [CURRENT_USER_KEY]: UserEntity
}
