import { Injectable, LoggerService, Scope } from '@nestjs/common'
import winston, { createLogger, Logger } from 'winston'
import { utilities as winstonModuleUtilities } from 'nest-winston/dist/winston.utilities'
import CloudWatchTransport from 'winston-cloudwatch'
import _ from 'lodash'
import { format } from 'date-fns'
import { AppConfigService } from '../config/config.service'
import { T_GenerateMetaOptions, T_MessageType, T_Meta } from './logger.types'
import { parseStack } from '../../common/helpers'
import { AsyncStorageService } from '../../providers/async-storage'

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private context = 'Default'

  private static winstonLogger: Logger

  constructor(
    private readonly config: AppConfigService,
    private readonly asyncStorage: AsyncStorageService,
  ) {}

  static getTransientInstance() {
    return new AppLoggerService(AppConfigService.getInstance(), new AsyncStorageService())
  }

  private getLoggerInstance(): Logger {
    if (!AppLoggerService.winstonLogger) {
      const enableConsole = !this.config.isCloudWatchEnabled || this.config.isLocal
      const defaultFormat = enableConsole
        ? winston.format.colorize({ all: true })
        : winston.format.uncolorize({
            level: !enableConsole,
            message: !enableConsole,
            raw: !enableConsole,
          })
      AppLoggerService.winstonLogger = createLogger({
        levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, http: 5, silly: 6 },
        format: defaultFormat,
        level: this.config.loggingLevel,
        transports: [],
      })

      if (enableConsole) {
        AppLoggerService.winstonLogger.add(
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp({ format: () => format(new Date(), 'dd/MM/yyyy HH:mm:ss') }),
              winston.format.ms(),
              winstonModuleUtilities.format.nestLike(
                `app-${this.config.environment}:${process.pid}`,
                { prettyPrint: true },
              ),
              winston.format.align(),
            ),
          }),
        )
      }

      if (this.config.isCloudWatchEnabled && this.config.cloudWatchConfig) {
        AppLoggerService.winstonLogger.add(
          new CloudWatchTransport({
            name: 'Cloudwatch Logs',
            level: this.config.loggingLevel,
            logGroupName: `escrypto-${this.config.environment}`,
            logStreamName: format(new Date(), 'dd/MM/yyyy'),
            awsAccessKeyId: this.config.cloudWatchConfig.awsAccessKey,
            awsSecretKey: this.config.cloudWatchConfig.awsSecretKey,
            awsRegion: this.config.cloudWatchConfig.awsRegion,
            retentionInDays: 14,
            jsonMessage: true,
          }),
        )
      }
    }

    return AppLoggerService.winstonLogger
  }

  public setContext(context: string): this {
    this.context = context

    return this
  }

  private generateMeta({ message, context, trace }: T_GenerateMetaOptions): T_Meta {
    const [first, ...other] = parseStack(this.generateMeta)
    const fileName =
      first && !first.getFileName()?.includes('node_modules') ? `\n\r${String(first)}}` : ''
    const stack = trace || other.map((i) => String(i))
    let meta: T_Meta = {
      message: '',
      timestamp: new Date().toISOString(),
      context: context || this.context,
      processID: process.pid,
      requestID: this.asyncStorage.getRequestID(),
      userID: this.asyncStorage.getUserID(),
    }

    if (_.isString(message)) {
      meta = { ...meta, message }
    } else if (_.isError(message)) {
      if ('isAxiosError' in message && message.isAxiosError) {
        meta = {
          ...meta,
          message: `${message.name}: ${message.message}`,
          request: {
            method: message.config.method,
            url: message.config.url,
            headers: message.config.headers,
            data: message.config.data,
          },
          response: {
            status: message?.response?.status,
            statusText: message?.response?.statusText,
            data: message?.response?.data,
          },
          stack,
        }
      } else {
        meta = {
          ...meta,
          message: `${message.name}: ${message.message}`,
          stack,
        }
      }
    } else {
      meta = { ...meta, message: '', ...message }
    }

    meta.message = `${meta.message}${fileName}`

    return meta
  }

  log(message: T_MessageType, context?: string): this {
    const { message: logMessage, ...meta } = this.generateMeta({ message, context })
    this.getLoggerInstance().info(logMessage, meta)

    return this
  }

  http(message: T_MessageType, context?: string): this {
    const { message: logMessage, ...meta } = this.generateMeta({ message, context })
    this.getLoggerInstance().http(logMessage, meta)

    return this
  }

  error(message: T_MessageType, trace?: string, context?: string): this {
    const { message: logMessage, ...meta } = this.generateMeta({ message, context, trace })
    this.getLoggerInstance().error(logMessage, meta)

    return this
  }

  warn(message: T_MessageType, context?: string): this {
    const { message: logMessage, ...meta } = this.generateMeta({ message, context })
    this.getLoggerInstance().warn(logMessage, meta)

    return this
  }

  debug(message: T_MessageType, context?: string): this {
    const { message: logMessage, ...meta } = this.generateMeta({ message, context })
    this.getLoggerInstance().debug(logMessage, meta)

    return this
  }

  verbose(message: T_MessageType, context?: string): this {
    const { message: logMessage, ...meta } = this.generateMeta({ message, context })
    this.getLoggerInstance().verbose(logMessage, meta)

    return this
  }
}
