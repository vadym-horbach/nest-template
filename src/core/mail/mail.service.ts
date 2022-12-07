import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface'
import { SentMessageInfo } from 'nodemailer'
import { minutesToMilliseconds } from 'date-fns'
import { T_SendCodeContext, T_SendUrlContext } from './mail.types'
import { AppLoggerService } from '../logger/logger.service'
import { RedlockService } from '../../common/providers'
import { AppConfigService } from '../config/config.service'
import { AsyncStorageService } from '../../providers/async-storage'

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly loggerService: AppLoggerService,
    private readonly asyncStorageService: AsyncStorageService,
    private readonly redlockService: RedlockService,
    private readonly configService: AppConfigService,
  ) {
    this.loggerService.setContext(MailService.name)
  }

  private async sendMail(options: ISendMailOptions): Promise<SentMessageInfo | null> {
    try {
      return await this.mailerService.sendMail({
        ...options,
        context: {
          ...options.context,
          from: options.context?.['from'] || options.from,
          to: options.context?.['to'] || options.to,
          clientRootUrl: options.context?.['clientRootUrl'] || this.configService.clientRootUrl,
          apiRootUrl: options.context?.['apiRootUrl'] || this.configService.apiRootUrl,
          i18nLang: options.context?.['i18nLang'] || this.asyncStorageService.getLanguage(),
        },
      })
    } catch (e: any) {
      this.loggerService.error(e)

      return null
    }
  }

  private async isUnlocked(key: string, minutes = 5) {
    return this.redlockService.isUnlocked(`mail_locked:${key}`, minutesToMilliseconds(minutes))
  }

  private async sendMailThrottled(options: ISendMailOptions, minutes = 5) {
    const isUnlocked = await this.isUnlocked(`${options.template}:${options.to}`, minutes)

    if (isUnlocked) {
      void this.sendMail(options)
    }

    return isUnlocked
  }

  async sendVerifyThrottled(to: string, context: T_SendUrlContext, i18nLang?: string) {
    return this.sendMailThrottled({
      to,
      subject: 'Verify your email',
      template: 'verify-email',
      context: { ...context, i18nLang },
    })
  }

  async sendChangeEmail(
    to: string,
    throttled: boolean,
    context: T_SendCodeContext,
    i18nLang?: string,
  ) {
    const options = {
      to,
      subject: 'Change Email',
      template: 'change-email',
      context: { ...context, i18nLang },
    }

    if (throttled) {
      return this.sendMailThrottled(options)
    }

    void this.sendMail(options)

    return true
  }

  async sendForgotThrottled(to: string, context: T_SendUrlContext, i18nLang?: string) {
    return this.sendMailThrottled({
      to,
      subject: 'Forgot password?',
      template: 'forgot-password',
      context: { ...context, i18nLang },
    })
  }
}
