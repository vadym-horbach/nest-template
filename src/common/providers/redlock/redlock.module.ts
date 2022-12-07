import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common'
import IORedis, { RedisOptions } from 'ioredis'
import { isString } from 'lodash'
import Redlock, { ResourceLockedError, ExecutionError, Lock, Settings } from 'redlock'

export class RedlockService extends Redlock {
  async isUnlocked(resources: string | string[], duration: number, settings?: Partial<Settings>) {
    try {
      const lock = await this.acquire(
        isString(resources) ? [resources] : resources,
        duration,
        settings,
      )

      if (duration === 0) {
        await lock.release()
      }

      return true
    } catch (e) {
      return false
    }
  }
}
type T_Options = {
  redlock?: Partial<Settings>
  redis: RedisOptions
}
interface I_AsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<T_Options> | T_Options
  inject?: any[]
}
@Module({})
export class RedlockModule {
  static register({ redis, redlock }: T_Options): DynamicModule {
    return {
      module: RedlockModule,
      providers: [
        {
          provide: RedlockService,
          useFactory: () => new RedlockService([new IORedis(redis)], redlock),
        },
      ],
    }
  }

  static registerAsync({ imports, inject, useFactory }: I_AsyncOptions): DynamicModule {
    return {
      module: RedlockModule,
      imports,
      providers: [
        {
          provide: RedlockService,
          useFactory: async (...args: any[]) => {
            const { redis, redlock } = await useFactory(...args)

            return new RedlockService([new IORedis(redis)], redlock)
          },
          inject,
        },
      ],
      exports: [RedlockService],
    }
  }
}
export { ResourceLockedError, ExecutionError, Lock }
export type {
  ClientExecutionResult,
  ExecutionResult,
  ExecutionStats,
  Settings,
  RedlockAbortSignal,
} from 'redlock'
