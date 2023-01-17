import { I18nContext, TranslateOptions } from 'nestjs-i18n'
import type errors from '../../languages/en/errors.json'
import type { T_ToDotted } from './type.helpers'

export type T_18nTranslations = {
  errors: typeof errors
}

export type T_18nPath = T_ToDotted<T_18nTranslations>

declare module 'nestjs-i18n' {
  // @ts-expect-error: Bad autocomplete
  export interface I_18nContext extends I18nContext<T_18nTranslations> {
    translate(key: T_18nPath, options?: TranslateOptions): string
    t(key: T_18nPath, options?: TranslateOptions): string
  }
}
