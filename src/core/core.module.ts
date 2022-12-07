import { ConfigModule } from '@nestjs/config'
import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import path from 'path'
import { I18nModule, I18nService } from 'nestjs-i18n'
import { ThrottlerModule } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'
import { validate } from './config/config.validate'
import { AppConfigService } from './config/config.service'
import { AppLoggerService } from './logger/logger.service'
import { AppInterceptor } from '../common/interceptors'
import { AppClassSerializerInterceptor } from '../common/serializers/responses'
import { MailService } from './mail/mail.service'
import { RedlockModule } from '../common/providers'
import { AppLanguageResolver } from '../common/pipes/app-language-resolver.service'
import { ThrottlerBehindProxyGuard } from '../common/guards'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate }),
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
        path: path.join(__dirname, '../languages/'),
        watch: true,
      },
      resolvers: [AppLanguageResolver],
      disableMiddleware: false,
    }),
    MailerModule.forRootAsync({
      inject: [AppConfigService, I18nService],
      useFactory: (config: AppConfigService, i18n: I18nService) => ({
        transport: {
          host: config.smtp.host,
          secure: config.smtp.secure,
          port: config.smtp.port,
          auth: { user: config.smtp.user, pass: config.smtp.password },
        },
        defaults: {
          from: { name: 'Escrypto', address: config.smtp.user },
          replyTo: { name: 'No Reply', address: config.smtp.user },
        },
        preview: config.isLocal ? { open: false } : false,
        template: {
          dir: path.join(__dirname, 'mail/templates'),
          adapter: new HandlebarsAdapter({ t: i18n.hbsHelper }),
          options: { strict: true },
        },
        options: {
          partials: {
            dir: path.join(__dirname, 'mail/templates/partials'),
            options: { strict: true },
          },
        },
      }),
    }),
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
  ],
  providers: [
    ThrottlerBehindProxyGuard,
    AppInterceptor,
    AppClassSerializerInterceptor,
    AppConfigService,
    AppLoggerService,
    MailService,
  ],
  exports: [
    AppClassSerializerInterceptor,
    JwtModule,
    AppConfigService,
    AppLoggerService,
    RedlockModule,
    MailService,
  ],
})
export class CoreModule {}
