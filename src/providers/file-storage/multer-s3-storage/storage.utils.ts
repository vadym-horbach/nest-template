import { BadRequestException, HttpException, PayloadTooLargeException } from '@nestjs/common'
import sharp, { ResizeOptions, Sharp } from 'sharp'
import { I_I18nContext } from 'nestjs-i18n'
import { MulterExceptionsEnum } from './storage.enums'

export const transformException = (i18n: I_I18nContext, error: Error | undefined): Error | void => {
  if (!error || error instanceof HttpException) {
    return error
  }

  switch (error.message) {
    case MulterExceptionsEnum.LIMIT_FILE_SIZE:
      return new PayloadTooLargeException(i18n.t('errors.file.tooLarge'))
    case MulterExceptionsEnum.LIMIT_FILE_COUNT:
      return new BadRequestException(i18n.t('errors.file.tooManyFiles'))
    case MulterExceptionsEnum.LIMIT_FIELD_KEY:
      return new BadRequestException(i18n.t('errors.file.nameTooLong'))
    case MulterExceptionsEnum.LIMIT_FIELD_VALUE:
      return new BadRequestException(i18n.t('errors.file.valueTooLong'))
    case MulterExceptionsEnum.LIMIT_FIELD_COUNT:
      return new BadRequestException(i18n.t('errors.file.tooManyFiles'))
    case MulterExceptionsEnum.LIMIT_UNEXPECTED_FILE:
      return new BadRequestException(i18n.t('errors.file.unexpectedField'))
    case MulterExceptionsEnum.LIMIT_PART_COUNT:
      return new BadRequestException(i18n.t('errors.file.tooManyParts'))
    case MulterExceptionsEnum.INVALID_IMAGE_FILE_TYPE:
      return new BadRequestException(i18n.t('errors.file.invalidFileType'))
    // Custom
    case MulterExceptionsEnum.ONLY_IMAGES_ALLOWED:
      return new BadRequestException(i18n.t('errors.file.onlyImages'))
    default:
      return error
  }
}

export const isOriginalPrefix = (prefix: string): boolean => prefix === 'original'
export const resizeImageStream = (
  fileStream: NodeJS.ReadableStream,
  options: ResizeOptions,
): Sharp => fileStream.pipe(sharp().resize(options))
