import path from 'path'
import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { I18nModule } from 'nestjs-i18n'
import { ThrottlerModule } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'
import { AppConfigService } from './config/config.service'
import { AppInterceptor } from '../common/interceptors'
import { AppClassSerializerInterceptor } from '../common/serializers/responses'
import { RedlockModule } from '../common/providers'
import { AppLanguageResolver } from '../common/pipes/app-language-resolver.service'
import { ThrottlerBehindProxyGuard } from '../common/guards'
import { AppCacheModule } from './cache/cache.module'
import { AsyncStorageModule } from './async-storage/async-storage.module'
import { AppConfigModule } from './config/config.module'
import { LoggerModule } from './logger/logger.module'
import { MailModule } from './mail/mail.module'
import { FileStorageModule } from './file-storage/file-storage.module'

@Global()
@Module({
  imports: [
    LoggerModule,
    AsyncStorageModule,
    AppConfigModule,
    AppCacheModule,
    ThrottlerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        ttl: config.rateLimit.ttl,
        limit: config.rateLimit.limit,
        storage: new ThrottlerStorageRedisService({
          host: config.cacheConfig.host,
          port: config.cacheConfig.port,
          password: config.cacheConfig.password,
          db: config.cacheConfig.db,
          keyPrefix: 'rate-limit:',
        }),
      }),
    }),
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: async (config: AppConfigService) => ({
        secret: config.defaultJwt.secret,
        signOptions: { algorithm: 'HS256', expiresIn: config.defaultJwt.expiresIn },
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      fallbacks: {
        'en-*': 'en',
        'es-*': 'es',
        'pt-*': 'pt',
        'de-*': 'de',
        'fr-*': 'fr',
        'it-*': 'it',
        'zh-*': 'zh',
        'ar-*': 'ar',
        'ru-*': 'ru',
      },
      loaderOptions: {
        path: path.join(__dirname, '..', 'languages'),
        watch: true,
      },
      resolvers: [AppLanguageResolver],
      disableMiddleware: false,
    }),
    MailModule,
    RedlockModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        redlock: {
          retryCount: 0,
        },
        redis: {
          host: config.cacheConfig.host,
          port: config.cacheConfig.port,
          password: config.cacheConfig.password,
          db: config.cacheConfig.db,
        },
      }),
    }),
    FileStorageModule,
  ],
  providers: [ThrottlerBehindProxyGuard, AppInterceptor, AppClassSerializerInterceptor],
  exports: [
    LoggerModule,
    AsyncStorageModule,
    AppConfigModule,
    AppCacheModule,
    MailModule,
    JwtModule,
    RedlockModule,
    AppClassSerializerInterceptor,
    FileStorageModule,
  ],
})
export class CoreModule {}
