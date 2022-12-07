import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { catchError, defer, map, Observable, of, switchMap, throwError } from 'rxjs'
import type { AxiosError } from 'axios'
import { AppConfigService, AppLoggerService } from '../../core'
import type {
  T_GetTokenResponse,
  T_GetTokenWithInfoResponse,
  T_GoogleOpenId,
  T_TokenInfo,
} from './types'
import { CryptoService } from '../crypto/crypto.service'
import { T_Nullable } from '../../common/interfaces'
import { T_TokenParamsVariants } from './types'

@Injectable()
export class GoogleAuthService {
  private readonly redirectUrl: string

  private readonly cachedEndpoints?: T_GoogleOpenId

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.redirectUrl = `${this.configService.clientRootUrl}/login`
    this.logger.setContext(GoogleAuthService.name)
  }

  private discoverGoogleEndpoints(endpoint: keyof T_GoogleOpenId) {
    return defer(() => {
      if (this.cachedEndpoints && this.cachedEndpoints[endpoint]) {
        return this.cachedEndpoints[endpoint]
      }

      return this.httpService
        .get<T_GoogleOpenId>('https://accounts.google.com/.well-known/openid-configuration')
        .pipe(
          map((res) => {
            return res.data[endpoint]
          }),
          catchError((err: AxiosError) => {
            this.logger.error(err)

            return throwError(
              () =>
                new InternalServerErrorException(
                  "Google discover documentation doesn't response. Try again later.",
                ),
            )
          }),
        )
    })
  }

  getAuthenticationUrl(
    hint?: T_Nullable<string>,
    redirectUrl?: T_Nullable<string>,
    state?: T_Nullable<Record<string, any>>,
  ) {
    const options = new URLSearchParams({
      access_type: 'online',
      include_granted_scopes: 'true',
      scope: this.configService.googleApi.scope,
      response_type: 'code',
      client_id: this.configService.googleApi.clientId,
      redirect_uri: redirectUrl || this.redirectUrl,
    })

    if (state) options.append('state', CryptoService.objectEncrypt(state))

    if (hint) options.append('login_hint', hint)

    return this.discoverGoogleEndpoints('authorization_endpoint').pipe(
      map((authorizationEndpoint) => `${authorizationEndpoint}?${options.toString()}`),
    )
  }

  tokenInfo<T extends T_TokenParamsVariants>(token: T): Observable<T_TokenInfo<T>> {
    const query = new URLSearchParams(token)

    return defer(() =>
      this.httpService.get<T_TokenInfo<T>>(
        `https://oauth2.googleapis.com/tokeninfo?${query.toString()}`,
      ),
    ).pipe(
      map((res) => {
        if ('expires_in' in res.data) {
          return { ...res.data, expires_in: +res.data.expires_in * 1000 + Date.now() }
        }

        return res.data
      }),
      catchError((err: AxiosError) => {
        this.logger.error(err)

        return throwError(() => new BadRequestException('Invalid Google access token'))
      }),
    )
  }

  getToken<I extends boolean = false, R extends boolean = false>(
    token: string,
    withInfo: I = false as I,
    isRefresh: R = false as R,
    redirectUrl?: R extends false ? T_Nullable<string> : never,
  ): Observable<T_GetTokenWithInfoResponse<I>> {
    const exchangeCode$ = this.discoverGoogleEndpoints('token_endpoint').pipe(
      switchMap((tokenEndpoint) => {
        const options = new URLSearchParams({
          client_id: this.configService.googleApi.clientId,
          client_secret: this.configService.googleApi.secret,
          grant_type: isRefresh ? 'refresh_token' : 'authorization_code',
        })

        if (isRefresh) {
          options.append('refresh_token', token)
        } else {
          options.append('code', token)
          options.append('redirect_uri', redirectUrl || this.redirectUrl)
        }

        return this.httpService
          .post<T_GetTokenResponse>(tokenEndpoint, options, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          .pipe(
            catchError((err: AxiosError) => {
              this.logger.error(err)

              return throwError(() => {
                return new BadRequestException('Error submitting Google access_code')
              })
            }),
          )
      }),
      map((res) => {
        return { ...res.data, expires_in: res.data.expires_in * 1000 + Date.now() }
      }),
    )

    if (withInfo) {
      return exchangeCode$.pipe(
        switchMap((tokens) =>
          this.tokenInfo({
            access_token: tokens.access_token,
            id_token: tokens.id_token,
          }).pipe(
            map((tokensInfo) => ({
              ...tokensInfo,
              ...tokens,
            })),
          ),
        ),
      ) as Observable<T_GetTokenWithInfoResponse<I>>
    }

    return exchangeCode$ as Observable<T_GetTokenWithInfoResponse<I>>
  }

  revokeToken(token: string): Observable<boolean> {
    return this.discoverGoogleEndpoints('revocation_endpoint').pipe(
      switchMap((revocationEndpoint) =>
        this.httpService
          .post(
            revocationEndpoint,
            new URLSearchParams({
              token,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
          )
          .pipe(
            map((res) => res.status === 200),
            catchError((err: AxiosError) => {
              this.logger.error(err)

              return of(false)
            }),
          ),
      ),
    )
  }
}
