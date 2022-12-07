import type { TranslateOptions, I18nContext } from 'nestjs-i18n'
import type { ArgumentsHost } from '@nestjs/common'
import type errors from '../../languages/en/errors.json'
import type { T_Join, T_PathsToStringProps } from './type.helpers'

type T_Translate = {
  errors: typeof errors
}
export type T_TranslateDotted = T_Join<T_PathsToStringProps<T_Translate>, '.'>

// Overwrite key declaration from @nestjs-i18n
declare module 'nestjs-i18n' {
  export interface I_I18nContext extends I18nContext {
    translate<T = any>(key: T_TranslateDotted, options?: TranslateOptions): T
    t<T = any>(key: T_TranslateDotted, options?: TranslateOptions): T
  }

  export function getI18nContextFromRequest(req: any): I_I18nContext
  export function getI18nServiceFromGraphQLContext(graphqlContext: any): I_I18nContext
  export function getI18nServiceFromRpcContext(rpcContext: any): I_I18nContext
  export function getI18nContextFromArgumentsHost(ctx: ArgumentsHost): I_I18nContext
}
