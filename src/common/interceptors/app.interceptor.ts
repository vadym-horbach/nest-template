import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { AppLoggerService, AsyncStorageService } from '../../core'
import { HEADER_REQUEST_ID } from '../constants'
import { I_AuthorizedFastifyRequest } from '../../modules/auth/auth.types'
import { I_FastifyReply } from '../interfaces'
import { CURRENT_USER_KEY } from '../../modules/auth/guards/constants'

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly asyncStorage: AsyncStorageService,
  ) {
    this.logger.setContext(AppInterceptor.name)
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<I_AuthorizedFastifyRequest>()
    const { method, url } = request

    const requestID = request.headers[HEADER_REQUEST_ID] || request.id
    const userID = request[CURRENT_USER_KEY]?.id || 'unauthorized'
    this.asyncStorage.setRequestID(requestID).setUserID(userID).setI18n(context)

    if (url !== '/') {
      this.logger.http({
        eventType: 'start-request',
        message: `Start request with id: ${requestID}. Initiated by ${userID}`,
        method,
        url,
        headers: request.headers,
      })
    }

    const startTime = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<I_FastifyReply>()
          response.header(HEADER_REQUEST_ID, requestID)

          if (url !== '/') {
            const responseTime = Date.now() - startTime
            this.logger.http({
              eventType: 'end-request',
              message: `End request with id: ${requestID}. Initiated by ${userID}`,
              method,
              url,
              responseTime,
            })
          }
        },
        error: (error) => {
          const response = context.switchToHttp().getResponse<I_FastifyReply>()
          response.header(HEADER_REQUEST_ID, requestID)

          if (url !== '/') {
            const responseTime = Date.now() - startTime
            this.logger.error(error)
            this.logger.http({
              eventType: 'failed-request',
              message: `Failed request with id: ${requestID}. Initiated by ${userID}`,
              method,
              url,
              responseTime,
            })
          }
        },
      }),
    )
  }
}
