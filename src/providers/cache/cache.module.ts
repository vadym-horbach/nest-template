import { Module, CacheModule, Global } from '@nestjs/common'
import { AppConfigService } from '../../core'
import { AppCacheService } from './cache.service'
import { redisStore } from './redis.store'

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [AppConfigService],
      isGlobal: true,
      useFactory: async (config: AppConfigService) => ({
        store: redisStore,
        host: config.cacheConfig.host,
        port: config.cacheConfig.port,
        password: config.cacheConfig.password,
        db: config.cacheConfig.db,
        ttl: config.cacheConfig.ttl,
      }),
    }),
  ],
  providers: [AppCacheService],
  exports: [AppCacheService, CacheModule],
})
export class AppCacheModule {}
