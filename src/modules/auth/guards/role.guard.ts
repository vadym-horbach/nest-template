import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRolesEnum } from '../../../models/user'
import { CURRENT_USER_KEY, PERMITTED_ROLES_KEY } from './constants'
import { I_AuthorizedFastifyRequest } from '../auth.types'
import { AsyncStorageService } from '../../../core'

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly asyncStorageService: AsyncStorageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const i18n = this.asyncStorageService.setI18n(context).getI18n()

    const permittedRoles = this.reflector.getAllAndOverride<UserRolesEnum[]>(PERMITTED_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!permittedRoles.length) return true

    const request = context.switchToHttp().getRequest<I_AuthorizedFastifyRequest>()

    const user = request[CURRENT_USER_KEY]

    if (!user) {
      throw new InternalServerErrorException(i18n.t('errors.internal.default'))
    }

    if (user.role === UserRolesEnum.ADMIN) return true

    if (permittedRoles && !permittedRoles.includes(user.role)) {
      throw new ForbiddenException(i18n.t('errors.forbidden.permissions'))
    }

    return true
  }
}
