import {
  applyDecorators,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
  ApiMethodNotAllowedResponse,
  ApiTooManyRequestsResponse,
  ApiBadGatewayResponse,
  ApiConflictResponse,
  ApiUnprocessableEntityResponse,
  ApiUnsupportedMediaTypeResponse,
  ApiRequestTimeoutResponse,
  ApiPreconditionFailedResponse,
  ApiPayloadTooLargeResponse,
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiDefaultResponse,
  ApiFoundResponse,
  ApiGatewayTimeoutResponse,
  ApiGoneResponse,
  ApiMovedPermanentlyResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiNotAcceptableResponse,
  ApiOkResponse,
  ApiNotImplementedResponse,
  ApiResponseOptions,
  ApiHeader,
} from '@nestjs/swagger'
import { isString } from 'lodash'
import { HEADER_LANGUAGE } from '../../constants'

export const EnableCache = (options?: { key?: string; ttl?: number }) => {
  let decorators = [UseInterceptors(CacheInterceptor)]

  if (options?.key) {
    decorators = [...decorators, CacheKey(options.key)]
  }

  if (options?.ttl) {
    decorators = [...decorators, CacheTTL(options.ttl)]
  }

  return applyDecorators(...decorators)
}

export const ApiExceptions = (options: T_Options) => {
  const decorators = Object.entries(options).reduce(
    (previousValue: Array<ClassDecorator | MethodDecorator | PropertyDecorator>, [key, value]) => {
      const apiOptions = isString(value)
        ? { schema: { properties: { error: { example: key }, message: { example: value } } } }
        : value

      switch (key as T_ExceptionsTypes) {
        case 'BadRequest':
          return [...previousValue, ApiBadRequestResponse(apiOptions)]
        case 'Forbidden':
          return [...previousValue, ApiForbiddenResponse(apiOptions)]
        case 'Unauthorized':
          return [...previousValue, ApiUnauthorizedResponse(apiOptions)]
        case 'ServiceUnavailable':
          return [...previousValue, ApiServiceUnavailableResponse(apiOptions)]
        case 'InternalServerError':
          return [...previousValue, ApiInternalServerErrorResponse(apiOptions)]
        case 'MethodNotAllowed':
          return [...previousValue, ApiMethodNotAllowedResponse(apiOptions)]
        case 'TooManyRequests':
          return [...previousValue, ApiTooManyRequestsResponse(apiOptions)]
        case 'BadGateway':
          return [...previousValue, ApiBadGatewayResponse(apiOptions)]
        case 'Conflict':
          return [...previousValue, ApiConflictResponse(apiOptions)]
        case 'UnprocessableEntity':
          return [...previousValue, ApiUnprocessableEntityResponse(apiOptions)]
        case 'UnsupportedMediaType':
          return [...previousValue, ApiUnsupportedMediaTypeResponse(apiOptions)]
        case 'RequestTimeout':
          return [...previousValue, ApiRequestTimeoutResponse(apiOptions)]
        case 'PreconditionFailed':
          return [...previousValue, ApiPreconditionFailedResponse(apiOptions)]
        case 'PayloadTooLarge':
          return [...previousValue, ApiPayloadTooLargeResponse(apiOptions)]
        case 'Accepted':
          return [...previousValue, ApiAcceptedResponse(apiOptions)]
        case 'Created':
          return [...previousValue, ApiCreatedResponse(apiOptions)]
        case 'Default':
          return [...previousValue, ApiDefaultResponse(apiOptions)]
        case 'Found':
          return [...previousValue, ApiFoundResponse(apiOptions)]
        case 'GatewayTimeout':
          return [...previousValue, ApiGatewayTimeoutResponse(apiOptions)]
        case 'Gone':
          return [...previousValue, ApiGoneResponse(apiOptions)]
        case 'MovedPermanently':
          return [...previousValue, ApiMovedPermanentlyResponse(apiOptions)]
        case 'NoContent':
          return [...previousValue, ApiNoContentResponse(apiOptions)]
        case 'NotFound':
          return [...previousValue, ApiNotFoundResponse(apiOptions)]
        case 'NotAcceptable':
          return [...previousValue, ApiNotAcceptableResponse(apiOptions)]
        case 'Ok':
          return [...previousValue, ApiOkResponse(apiOptions)]
        case 'NotImplemented':
          return [...previousValue, ApiNotImplementedResponse(apiOptions)]
        default:
          return previousValue
      }
    },
    [],
  )

  return applyDecorators(...decorators)
}

type T_ExceptionsTypes =
  | 'BadRequest'
  | 'Forbidden'
  | 'Unauthorized'
  | 'ServiceUnavailable'
  | 'InternalServerError'
  | 'MethodNotAllowed'
  | 'TooManyRequests'
  | 'BadGateway'
  | 'Conflict'
  | 'UnprocessableEntity'
  | 'UnsupportedMediaType'
  | 'RequestTimeout'
  | 'PreconditionFailed'
  | 'PayloadTooLarge'
  | 'Accepted'
  | 'Created'
  | 'Default'
  | 'Found'
  | 'GatewayTimeout'
  | 'Gone'
  | 'MovedPermanently'
  | 'NoContent'
  | 'NotFound'
  | 'NotAcceptable'
  | 'Ok'
  | 'NotImplemented'
type T_Options = Partial<Record<T_ExceptionsTypes, string | ApiResponseOptions>>

export const ApiGlobalHeaders = () => {
  return applyDecorators(ApiHeader({ name: HEADER_LANGUAGE, description: 'Language' }))
}
