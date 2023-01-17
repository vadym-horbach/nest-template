import { from, Observable, switchMap } from 'rxjs'
import { minutesToMilliseconds } from 'date-fns'
import { Inject, OnModuleInit } from '@nestjs/common'
import { AppConfigService, AppLoggerService } from '../core'
import { getCaller } from '../common/utils'
import { ExecutionError, Lock, RedlockService } from '../common/providers'

export abstract class BasicJobsService implements OnModuleInit {
  @Inject(AppConfigService)
  protected readonly config!: AppConfigService

  @Inject(AppLoggerService)
  protected readonly logger!: AppLoggerService

  @Inject(RedlockService)
  protected readonly redLock!: RedlockService

  onModuleInit() {
    this.logger.setContext(this.constructor.name)
  }

  lock(callback: (lock: Lock) => Promise<any> | Observable<any>, key?: string) {
    const lockKey = key || getCaller()
    from(
      this.redLock.acquire([`lock:${lockKey}`], minutesToMilliseconds(1), {
        retryCount: 5,
      }),
    )
      .pipe(switchMap(callback))
      .subscribe({
        error: (err) => {
          if (!(err instanceof ExecutionError)) {
            this.logger.error(err)
          }
        },
      })
  }
}
