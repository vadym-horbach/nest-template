import { ClassSerializerInterceptor, PlainLiteralObject } from '@nestjs/common'
import { ClassTransformOptions } from 'class-transformer'

export class AppClassSerializerInterceptor extends ClassSerializerInterceptor {
  private static prepareResponse(
    response: PlainLiteralObject | PlainLiteralObject[] | any,
  ): PlainLiteralObject | PlainLiteralObject[] | any {
    // TODO Serialize
    // if (response instanceof BaseEntity || response instanceof BaseDto) {
    //   return response
    // }
    //
    // if (response instanceof Date) {
    //   return response.toISOString()
    // }

    // if (_.isArray(response)) {
    //   return response.map(AppClassSerializerInterceptor.prepareResponse)
    // }
    //
    // if (_.isObjectLike(response)) {
    //   return _.mapValues(response, AppClassSerializerInterceptor.prepareResponse)
    // }

    return response
  }

  serialize(
    response: PlainLiteralObject | PlainLiteralObject[],
    options: ClassTransformOptions,
  ): PlainLiteralObject | PlainLiteralObject[] {
    return super.serialize(AppClassSerializerInterceptor.prepareResponse(response), options)
  }
}
