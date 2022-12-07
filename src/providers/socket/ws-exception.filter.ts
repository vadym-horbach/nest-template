import { Catch, HttpException, UnauthorizedException } from '@nestjs/common'
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets'
import { I18nValidationException } from 'nestjs-i18n'
import { isObject } from '@nestjs/common/utils/shared.utils'
import { EventsEnum, T_AuthorizedSocket, T_Exception } from './types'

@Catch(WsException, HttpException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  // @ts-expect-error: Rewritten type
  handleError(client: T_AuthorizedSocket, exception: any) {
    if (exception instanceof HttpException) {
      this.handleHttpError(client, exception)
    } else {
      super.handleError(client, exception)
    }
  }

  private handleHttpError(client: T_AuthorizedSocket, exception: HttpException) {
    const exceptionResponse = exception.getResponse()
    const response: T_Exception = isObject(exceptionResponse)
      ? (exceptionResponse as T_Exception)
      : { statusCode: exception.getStatus(), message: exceptionResponse }

    if (exception instanceof UnauthorizedException) {
      client.emit(EventsEnum.KICKED, {
        statusCode: response.statusCode,
        reason: response.message || 'Internal server error',
        error: response.error,
      })

      client.disconnect()

      return
    }

    if (exception instanceof I18nValidationException) {
      super.handleError(client, new WsException({ ...response, errors: exception.errors }))

      return
    }

    super.handleError(client, new WsException(response))
  }
}
