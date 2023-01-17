import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { ThrottlerModuleOptions } from '@nestjs/throttler/dist/throttler-module-options.interface'
import { ThrottlerStorage } from '@nestjs/throttler/dist/throttler-storage.interface'
import { Reflector } from '@nestjs/core'
import { AsyncStorageService } from '../../core'

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly asyncStorageService: AsyncStorageService,
  ) {
    super(options, storageService, reflector)
  }

  protected getTracker(req: Record<string, any>): string {
    return req['ips'].length ? req['ips'][0] : req['ip']
  }

  protected throwThrottlingException(context: ExecutionContext) {
    const i18n = this.asyncStorageService.setI18n(context).getI18n()
    throw new ThrottlerException(i18n.t('errors.throttler.default'))
  }
}
