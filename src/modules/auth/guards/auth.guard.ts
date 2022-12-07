import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { getI18nContextFromArgumentsHost } from 'nestjs-i18n'
import { isEqual, startOfToday } from 'date-fns'
import { ImATeapotException } from '@nestjs/common/exceptions/im-a-teapot.exception'
import { AuthService } from '../auth.service'
import { HEADER_AUTHORIZATION } from '../../../common/constants'
import { I_AuthorizedFastifyRequest } from '../auth.types'
import { AsyncStorageService } from '../../../providers/async-storage'
import { CURRENT_USER_KEY, IS_PUBLIC_KEY } from './constants'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly asyncStorageService: AsyncStorageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) return true

    const request = context.switchToHttp().getRequest<I_AuthorizedFastifyRequest>()

    const i18n = getI18nContextFromArgumentsHost(context)
    this.asyncStorageService.setI18n(i18n)

    const jwtToken = request.headers[HEADER_AUTHORIZATION]?.split(' ').pop()
    if (!jwtToken) throw new UnauthorizedException(i18n.t('errors.unauthorized.tokenNotProvided'))

    const user = await this.authService.findUserByToken(jwtToken)

    if (!user.lastActivities || !isEqual(user.lastActivities, startOfToday())) {
      user.lastActivities = startOfToday()
      user.updatedAt = new Date(user.updatedAt.getTime() + 1)
      await user.save()
    }

    const lang = user.language

    if (user.isBanned) {
      throw new ForbiddenException(i18n.t('errors.forbidden.banned', { lang }))
    }

    if (!user.isVerifiedEmail) {
      throw new ImATeapotException(i18n.t('errors.imATeapot.shouldVerify', { lang }))
    }

    request[CURRENT_USER_KEY] = user

    return true
  }
}
