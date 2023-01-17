import { ExecutionContext, Inject, Injectable, MethodNotAllowedException } from '@nestjs/common'
import { AsyncLocalStorage } from 'node:async_hooks'
import { I18nContext, I18nService, I_18nContext } from 'nestjs-i18n'
import type { UserEntity } from '../../models'
import { T_18nTranslations } from '../../common/interfaces'

@Injectable()
export class AsyncStorageService {
  @Inject(I18nService)
  private readonly i18nService!: I18nService<T_18nTranslations>

  private readonly asyncStore = new AsyncLocalStorage<Map<string, any>>()

  getAsyncStorage() {
    return this.asyncStore
  }

  static getInitialStore() {
    return new Map<string, any>()
  }

  private setValue(key: string, value: any) {
    this.asyncStore.getStore()?.set(key, value)

    return this
  }

  private getValue<T>(key: string) {
    return this.asyncStore.getStore()?.get(key) as T | undefined
  }

  setRequestID(value: string) {
    return this.setValue('requestID', value)
  }

  getRequestID() {
    return this.getValue<string>('requestID')
  }

  setUserID(value: string | UserEntity['id']): this {
    return this.setValue('userID', value)
  }

  getUserID() {
    return this.getValue<string | UserEntity['id']>('userID')
  }

  setLanguage(value: string) {
    return this.setValue('language', value)
  }

  getLanguage() {
    return this.getValue<string>('language')
  }

  setI18n(value: ExecutionContext) {
    const i18nContext = I18nContext.current(value)

    if (i18nContext) {
      this.setLanguage(i18nContext.lang).setValue('i18n', i18nContext)
    }

    return this
  }

  getI18n(): I_18nContext {
    const cached = this.getValue<I_18nContext>('i18n')
    if (cached) return cached

    const ctx = <I_18nContext>I18nContext.current()
    if (ctx) return ctx

    if (!this.i18nService) throw new MethodNotAllowedException()

    return new I18nContext('en', this.i18nService)
  }
}
