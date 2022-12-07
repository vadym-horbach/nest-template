import { Global, Module, OnModuleInit } from '@nestjs/common'
import { HttpModule, HttpService } from '@nestjs/axios'
import { HelpersService } from './helpers/helpers.service'
import { AppLoggerService } from '../core'
import { providers } from './index'

@Global()
@Module({
  imports: [HttpModule],
  providers,
  exports: [...providers, HttpModule],
  controllers: [],
})
export class SharedModule implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(SharedModule.name)
  }

  onModuleInit(): void {
    // TODO Log rejected requests
    this.httpService.axiosRef.interceptors.request.use((req) => {
      const url = HelpersService.urlFromString(req.url)
      // TODO hide sensitive data
      const excludedParams = ['access_token', 'id_token', 'token']

      if (url) {
        excludedParams.forEach((paramName) => {
          if (url.searchParams.has(paramName)) {
            url.searchParams.set(paramName, '__HIDDEN__')
          }
        })
        this.logger.verbose({
          message: `Outgoing request to: ${String(url)}`,
          responseType: req.responseType,
          params: req.params,
          data: req.data,
        })
      }

      return req
    })
  }
}
