import { Inject, Injectable, MethodNotAllowedException } from '@nestjs/common'
import { AsyncLocalStorage } from 'node:async_hooks'
import { I18nContext, I_I18nContext, I18nService } from 'nestjs-i18n'
import type { UserEntity } from '../../models'

@Injectable()
export class AsyncStorageService {
  @Inject(I18nService)
  private readonly i18nService!: I18nService

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

  setI18n(value: I18nContext) {
    return this.setLanguage(value.lang).setValue('i18n', value)
  }

  getI18n(): I_I18nContext {
    const res = this.getValue<I18nContext>('i18n')
    if (res) return res

    if (!this.i18nService) throw new MethodNotAllowedException()

    return new I18nContext('en', this.i18nService)
  }
}
