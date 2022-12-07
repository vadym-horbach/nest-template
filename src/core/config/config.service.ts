import dotenv from 'dotenv'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { VALIDATED_ENV_PROPNAME } from '@nestjs/config/dist/config.constants'
import path from 'path'
import fs from 'fs'
import { EnvironmentEnum, EnvironmentDTO, LoggingLevelsEnum, validate } from './config.validate'

@Injectable()
export class AppConfigService extends ConfigService<EnvironmentDTO> {
  private static instance: AppConfigService

  constructor(internalConfig?: Record<string, any>) {
    super(internalConfig)

    // @ts-expect-error: @nestjs/config ALWAYS reads from process.env so this causes it to read internally
    this.getFromProcessEnv = () => undefined
  }

  static getInstance() {
    if (!AppConfigService.instance) {
      const envPath = path.resolve(process.cwd(), '.env')
      const config = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {}

      AppConfigService.instance = new AppConfigService({
        [VALIDATED_ENV_PROPNAME]: validate({ ...config, ...process.env }),
      })
    }

    return AppConfigService.instance
  }

  get environment() {
    return <EnvironmentEnum>this.get('NODE_ENV')
  }

  get isLocal() {
    return this.environment === EnvironmentEnum.LOCAL
  }

  get isDevelopment() {
    return this.environment === EnvironmentEnum.DEVELOPMENT
  }

  get isProduction() {
    return this.environment === EnvironmentEnum.PRODUCTION
  }

  get port() {
    return <number>this.get('NODE_PORT')
  }

  get isClusterEnabled() {
    return !this.isLocal && <boolean>this.get('ENABLE_CLUSTER')
  }

  get loggingLevel() {
    return <LoggingLevelsEnum>this.get('LOGGING_LEVEL')
  }

  get apiRootUrl() {
    return <string>this.get('API_ROOT_URL')
  }

  get clientRootUrl() {
    return <string>this.get('CLIENT_ROOT_URL')
  }

  get corsOrigins() {
    const originsString = <string>this.get('CORS_ORIGINS')
    const origins = originsString.split(' ').filter((e) => e !== '')

    return [this.clientRootUrl, this.apiRootUrl, ...origins]
  }

  get defaultJwt() {
    return {
      secret: <string>this.get('DEFAULT_JWT_SECRET'),
      expiresIn: <string>this.get('DEFAULT_JWT_EXPIRES'),
    }
  }

  get refreshJwt() {
    return {
      secret: <string>this.get('REFRESH_JWT_SECRET'),
      expiresIn: <string>this.get('REFRESH_JWT_EXPIRES'),
    }
  }

  get isCloudWatchEnabled() {
    return <boolean>this.get('ENABLE_CLOUDWATCH')
  }

  get cloudWatchConfig() {
    const config = {
      awsAccessKey: <string>this.get('AWS_CLOUDWATCH_ACCESS_KEY'),
      awsSecretKey: <string>this.get('AWS_CLOUDWATCH_KEY_SECRET'),
      awsRegion: <string>this.get('AWS_CLOUDWATCH_REGION'),
    }

    if (config.awsAccessKey && config.awsSecretKey && config.awsRegion) {
      return config
    }

    return null
  }

  get database(): PostgresConnectionOptions {
    return {
      type: 'postgres',
      host: <string>this.get('DB_HOST'),
      port: <number>this.get('DB_PORT'),
      username: <string>this.get('DB_USERNAME'),
      password: <string>this.get('DB_PASSWORD'),
      database: <string>this.get('DB_DATABASE'),
      logging: this.isLocal,
    }
  }

  get cacheConfig() {
    return {
      host: <string>this.get('REDIS_HOST'),
      port: <number>this.get('REDIS_PORT'),
      password: this.get<string>('REDIS_PASSWORD'),
      ttl: <number>this.get('REDIS_CACHE_TTL'),
      db: <number>this.get('REDIS_DB'),
    }
  }

  get googleApi() {
    return {
      clientId: <string>this.get('GOOGLE_CLIENT_ID'),
      secret: <string>this.get('GOOGLE_CLIENT_SECRET'),
      scope: <string>this.get('GOOGLE_SCOPE'),
    }
  }

  get appleApi() {
    return {
      clientId: <string>this.get('APPLE_CLIENT_ID'),
      secret: <string>this.get('APPLE_CLIENT_SECRET'),
      scope: <string>this.get('APPLE_SCOPE'),
    }
  }

  get rateLimit() {
    return {
      ttl: <number>this.get('RATE_LIMIT_TTL'),
      limit: <number>this.get('RATE_LIMIT'),
    }
  }

  get smtp() {
    return {
      host: <string>this.get('SMTP_HOST'),
      port: <number>this.get('SMTP_PORT'),
      secure: <boolean>this.get('SMTP_SECURE'),
      from: this.get<string>('MAIL_FROM'),
      user: <string>this.get('SMTP_USER'),
      password: <string>this.get('SMTP_PASSWORD'),
    }
  }

  get s3Config() {
    return {
      awsAccessKey: <string>this.get('AWS_S3_ACCESS_KEY'),
      awsSecretKey: <string>this.get('AWS_S3_KEY_SECRET'),
      awsRegion: <string>this.get('AWS_S3_REGION'),
      bucket: <string>this.get('AWS_S3_BUCKET'),
    }
  }
}
