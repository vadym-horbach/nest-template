import { I18nResolver } from 'nestjs-i18n'
import { pick } from 'accept-language-parser'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { I_AuthorizedFastifyRequest } from '../../modules/auth/auth.types'
import { HEADER_LANGUAGE } from '../constants'
import { CURRENT_USER_KEY } from '../../modules/auth/guards/constants'

@Injectable()
export class AppLanguageResolver implements I18nResolver {
  async resolve(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<I_AuthorizedFastifyRequest>()
    const supportedLanguages = request['i18nService']?.getSupportedLanguages() || []
    const headerLanguage = this.resolveHeader(HEADER_LANGUAGE, request, supportedLanguages)
    const user = request[CURRENT_USER_KEY]

    if (request.raw) {
      // @ts-expect-error: Remove i18n middleware values, to overwrite them after guard
      delete request.raw.i18nService
      // @ts-expect-error: Remove i18n middleware values, to overwrite them after guard
      delete request.raw.i18nLang
    }

    if (headerLanguage) {
      if (user && user.language !== headerLanguage) {
        user.language = headerLanguage
        await user.save()
      }

      return headerLanguage
    }

    if (user) {
      return user.language
    }

    return this.resolveHeader('accept-language', request, supportedLanguages)
  }

  resolveHeader(header: string, request: I_AuthorizedFastifyRequest, supportedLanguages: string[]) {
    const lang = request.headers[header]
    if (!lang) return lang

    const picked = pick(supportedLanguages, lang) ?? pick(supportedLanguages, lang, { loose: true })
    if (picked) return picked

    return undefined
  }
}
