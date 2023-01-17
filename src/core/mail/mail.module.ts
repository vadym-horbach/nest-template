import { Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'
import { I18nService } from 'nestjs-i18n'
import path from 'path'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { AppConfigService } from '../config/config.service'
import { MailService } from './mail.service'

@Module({
  imports: [
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
          from: { name: 'App', address: config.smtp.user },
          replyTo: { name: 'No Reply', address: config.smtp.user },
        },
        preview: config.isLocal ? { open: false } : false,
        template: {
          dir: path.join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter({ t: i18n.hbsHelper }),
          options: { strict: true },
        },
        options: {
          partials: {
            dir: path.join(__dirname, 'templates', 'partials'),
            options: { strict: true },
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
