import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { getI18nContextFromArgumentsHost } from 'nestjs-i18n'

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    return req['ips'].length ? req['ips'][0] : req['ip']
  }

  protected throwThrottlingException(context: ExecutionContext) {
    const i18n = getI18nContextFromArgumentsHost(context)
    throw new ThrottlerException(i18n.t('errors.throttler.default'))
  }
}
