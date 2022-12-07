import { BadRequestException, ValidationError } from '@nestjs/common'
import { i18nValidationErrorFactory } from 'nestjs-i18n'

export const exceptionFactory = (errors: ValidationError[]): BadRequestException => {
  // TODO Normalize Errors
  return i18nValidationErrorFactory(errors)
}
