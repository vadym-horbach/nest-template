import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common'
import type { UserEntity } from '../../models'
import type { I_AuthorizedFastifyRequest } from './auth.types'
import { UserRolesEnum } from '../../models/user'
import { RoleGuard } from './guards'
import {
  CURRENT_USER_KEY,
  IGNORE_VERIFY_KYC_KEY,
  IS_PUBLIC_KEY,
  PERMITTED_ROLES_KEY,
} from './guards/constants'

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext): UserEntity => {
    const request = context.switchToHttp().getRequest<I_AuthorizedFastifyRequest>()

    return request[CURRENT_USER_KEY]
  },
)

export const AuthDisableVerifyKYC = () => SetMetadata(IGNORE_VERIFY_KYC_KEY, true)

export const AuthDisable = () => {
  return applyDecorators(SetMetadata(IS_PUBLIC_KEY, true), AuthDisableVerifyKYC())
}

export const PermittedRoles = (roles = [UserRolesEnum.USER, UserRolesEnum.ADMIN]) => {
  return applyDecorators(UseGuards(RoleGuard), SetMetadata(PERMITTED_ROLES_KEY, roles))
}
