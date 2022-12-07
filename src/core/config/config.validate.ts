import { plainToInstance } from 'class-transformer'
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator'
import { IsBooleanLike } from '../../common/decorators/validation'

export enum EnvironmentEnum {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
  LOCAL = 'local',
  TEST = 'test',
}

export enum LoggingLevelsEnum {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

export class EnvironmentDTO {
  // Server
  @IsDefined()
  @IsEnum(EnvironmentEnum)
  NODE_ENV: EnvironmentEnum = EnvironmentEnum.DEVELOPMENT

  @IsDefined()
  @IsNumber()
  NODE_PORT: number = 5000

  @IsDefined()
  @IsBooleanLike()
  ENABLE_CLUSTER: boolean = true

  @IsDefined()
  @IsEnum(LoggingLevelsEnum)
  LOGGING_LEVEL: LoggingLevelsEnum = LoggingLevelsEnum.HTTP

  @IsDefined()
  @IsUrl({ require_tld: false })
  API_ROOT_URL: string = 'http://localhost:5000'

  @IsDefined()
  @IsUrl({ require_tld: false })
  CLIENT_ROOT_URL: string = 'http://localhost:5000'

  @IsDefined()
  @IsString()
  CORS_ORIGINS: string = ''

  // Auth
  @IsDefined()
  @IsString()
  DEFAULT_JWT_SECRET: string = 'DEFAULT_JWT_SECRET'

  @IsDefined()
  @IsString()
  DEFAULT_JWT_EXPIRES: string = '4 hours'

  @IsDefined()
  @IsString()
  REFRESH_JWT_SECRET: string = 'REFRESH_JWT_SECRET'

  @IsDefined()
  @IsString()
  REFRESH_JWT_EXPIRES: string = '21 days'

  // AWS CloudWatch
  @IsDefined()
  @IsBooleanLike()
  ENABLE_CLOUDWATCH: boolean = false

  @IsOptional()
  @IsString()
  AWS_CLOUDWATCH_ACCESS_KEY!: string

  @IsOptional()
  @IsString()
  AWS_CLOUDWATCH_KEY_SECRET!: string

  @IsOptional()
  @IsString()
  AWS_CLOUDWATCH_REGION!: string

  // ## DATABASE ##
  @IsDefined()
  @IsString()
  DB_HOST: string = 'localhost'

  @IsDefined()
  @IsNumber()
  DB_PORT: number = 5432

  @IsDefined()
  @IsString()
  DB_DATABASE: string = 'main'

  @IsDefined()
  @IsString()
  DB_USERNAME!: string

  @IsDefined()
  @IsString()
  DB_PASSWORD!: string

  // ## REDIS ##
  @IsDefined()
  @IsString()
  REDIS_HOST: string = 'localhost'

  @IsDefined()
  @IsNumber()
  REDIS_PORT: number = 6379

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string

  @IsDefined()
  @IsNumber()
  REDIS_DB: number = 0

  @IsDefined()
  @IsNumber()
  REDIS_CACHE_TTL: number = 3600 // In Seconds

  // Rate Limit
  @IsDefined()
  @IsNumber()
  RATE_LIMIT_TTL: number = 1 // In Seconds

  @IsDefined()
  @IsNumber()
  RATE_LIMIT: number = 20 // Count

  // GOOGLE
  @IsDefined()
  @IsString()
  GOOGLE_CLIENT_ID!: string

  @IsDefined()
  @IsString()
  GOOGLE_CLIENT_SECRET!: string

  @IsDefined()
  @IsString()
  GOOGLE_SCOPE: string =
    'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'

  // APPLE
  @IsDefined()
  @IsString()
  APPLE_CLIENT_ID!: string

  @IsDefined()
  @IsString()
  APPLE_CLIENT_SECRET!: string

  @IsDefined()
  @IsString()
  APPLE_SCOPE: string = 'email name'

  // MAIL
  @IsDefined()
  @IsString()
  SMTP_HOST: string = 'smtp.gmail.com'

  @IsDefined()
  @IsNumber()
  SMTP_PORT: number = 465

  @IsDefined()
  @IsBooleanLike()
  SMTP_SECURE: boolean = true

  @IsOptional()
  @IsString()
  MAIL_FROM?: string

  @IsDefined()
  @IsString()
  SMTP_USER!: string

  @IsDefined()
  @IsString()
  SMTP_PASSWORD!: string

  // AWS S3
  @IsDefined()
  @IsString()
  AWS_S3_REGION!: string

  @IsDefined()
  @IsString()
  AWS_S3_BUCKET!: string

  @IsDefined()
  @IsString()
  AWS_S3_ACCESS_KEY!: string

  @IsDefined()
  @IsString()
  AWS_S3_KEY_SECRET!: string
}

export const validate = (config: Record<string, unknown>): EnvironmentDTO => {
  const validatedConfig = plainToInstance(EnvironmentDTO, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validatedConfig, {
    whitelist: true,
    forbidUnknownValues: true,
    validationError: {
      target: false,
    },
  })

  if (errors.length > 0) {
    throw new Error(String(errors))
  }

  return validatedConfig
}
