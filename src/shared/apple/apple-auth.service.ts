import { BadRequestException, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { catchError, map, of, throwError } from 'rxjs'
import type { AxiosError } from 'axios'
import { AppConfigService, AppLoggerService } from '../../core'
import type { T_GetTokenResponse } from './types'
import { CryptoService } from '../crypto/crypto.service'
import { T_Nullable } from '../../common/interfaces'

@Injectable()
export class AppleAuthService {
  private readonly redirectUrl: string

  private static readonly AUTHORIZE_URL = 'https://appleid.apple.com/auth/authorize'

  private static readonly TOKEN_URL = 'https://appleid.apple.com/auth/token'

  private static readonly REVOCATION_URL = 'https://appleid.apple.com/auth/revoke'

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.redirectUrl = `${this.configService.clientRootUrl}/login`
    this.logger.setContext(AppleAuthService.name)
  }

  getAuthenticationUrl(state?: T_Nullable<Record<string, any>>) {
    const options = new URLSearchParams({
      client_id: this.configService.googleApi.clientId,
      redirect_uri: this.redirectUrl,
      response_type: 'code',
      scope: this.configService.appleApi.scope,
      response_mode: 'form_post',
    })

    if (state) options.append('state', CryptoService.objectEncrypt(state))

    return `${AppleAuthService.AUTHORIZE_URL}?${options.toString()}`
  }

  getToken(token: string, isRefresh: boolean = false) {
    const options = new URLSearchParams({
      client_id: this.configService.appleApi.clientId,
      client_secret: this.configService.appleApi.secret,
      grant_type: isRefresh ? 'refresh_token' : 'authorization_code',
    })

    if (isRefresh) {
      options.append('refresh_token', token)
    } else {
      options.append('code', token)
    }

    return this.httpService
      .post<T_GetTokenResponse>(AppleAuthService.TOKEN_URL, options, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        catchError((err: AxiosError) => {
          this.logger.error(err)

          return throwError(() => {
            return new BadRequestException('Error submitting Apple Account access_code')
          })
        }),
        map((res) => {
          return { ...res.data, expires_in: res.data.expires_in * 1000 + Date.now() }
        }),
      )
  }

  revokeToken(token: string) {
    return this.httpService
      .post(AppleAuthService.REVOCATION_URL, new URLSearchParams({ token }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        map((res) => res.status === 200),
        catchError((err: AxiosError) => {
          this.logger.error(err)

          return of(false)
        }),
      )
  }
}
