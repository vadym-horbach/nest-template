import { UseInterceptors } from '@nestjs/common'
import { File } from 'fastify-multer/lib/interfaces'
import type { FastifyRequest } from 'fastify'
import type { I_MulterExtendedOptions } from './multer-s3-storage/storage.types'
import { AmazonS3FileInterceptor } from './interceptors/amazon-s3-file.interceptor'
import { T_Filters } from './file-storage.types'

export * from './file-storage.service'
export { I_FileS3 } from './multer-s3-storage/storage.types'

export const fileFilters: T_Filters = {
  image: (
    req: FastifyRequest,
    file: File,
    callback: (error: Error | null, acceptFile?: boolean) => void,
  ) => {
    const regex = /(^image)(\/)[a-zA-Z0-9_]*/gm

    if (!regex.test(file.mimetype)) {
      return callback(new Error('Only images are allowed'))
    }

    return callback(null, true)
  },
}
export const fileDirs = {
  BLOG: 'blog',
  PROFILE: 'profile',
}

export const UseAmazonS3File = (fieldName: string, localOptions?: I_MulterExtendedOptions) =>
  UseInterceptors(AmazonS3FileInterceptor(fieldName, localOptions))
