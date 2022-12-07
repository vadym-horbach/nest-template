import { Injectable } from '@nestjs/common'
import { AppCacheService } from '../../providers/cache/cache.service'
import type { UserEntity } from '../../models'
import { MailService } from '../../core'
import { T_EmailCodes } from './types'

@Injectable()
export class UserService {
  constructor(
    private readonly cacheService: AppCacheService,
    private readonly mailService: MailService,
  ) {}

  async sendChangeEmail(
    user: { email: string; firstName: string; lastName: string },
    code: string,
    throttled = true,
  ) {
    return this.mailService.sendChangeEmail(user.email, throttled, {
      name: `${user.firstName} ${user.lastName}`,
      code,
    })
  }

  async getChangeEmailCodes(userId: UserEntity['id']) {
    return this.cacheService.get<T_EmailCodes>(`change-email-codes:${userId}`)
  }

  async saveChangeEmailCodes(userId: UserEntity['id'], codes: T_EmailCodes) {
    return this.cacheService.set(`change-email-codes:${userId}`, codes)
  }

  async deleteChangeEmailCodes(userId: UserEntity['id']) {
    return this.cacheService.del(`change-email-codes:${userId}`)
  }
}
