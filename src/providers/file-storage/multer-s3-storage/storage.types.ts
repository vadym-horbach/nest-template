import type { S3 } from 'aws-sdk'
import type { ResizeOptions } from 'sharp'
import type { File, Options } from 'fastify-multer/lib/interfaces'
import type { FileStorageService } from '../file-storage.service'
import { I_FastifyRequest } from '../../../common/interfaces'

export interface I_FileS3 extends File {
  bucket: string
  key: string
  acl?: string
  contentType: string
  contentDisposition?: string
  storageClass?: string
  serverSideEncryption?: string
  metadata?: S3.Metadata
  location: string
  etag: string
  size: number
  sizes?: I_FileS3[]
}
export type T_OptionFunction = (
  req: I_FastifyRequest,
  file: I_FileS3,
  callback: (error: any, value?: any) => void,
) => void

export type T_S3StorageOptions = {
  fileStorageService: FileStorageService
  replace?: T_OptionFunction | boolean | undefined
  dynamicPath?: T_OptionFunction | string | string[] | undefined
  randomFilename?: T_OptionFunction | boolean | undefined
  bucket: T_OptionFunction | string
  key?: T_OptionFunction | string | undefined
  acl?: T_OptionFunction | string | undefined
  cacheControl?: T_OptionFunction | string | undefined
  contentType?: T_OptionFunction | string | undefined
  metadata?: T_OptionFunction | S3.Metadata
  storageClass?: T_OptionFunction | string | undefined
  contentDisposition?: T_OptionFunction | string | undefined
  contentEncoding?: T_OptionFunction | string | undefined
  serverSideEncryption?: T_OptionFunction | string | undefined
  SSEKMSKeyId?: T_OptionFunction | string | undefined
}

export interface I_ExtendResizeOptions extends ResizeOptions {
  prefix: string | 'original'
}

export type T_SharpOptions = ResizeOptions | I_ExtendResizeOptions[]

export interface I_MulterExtendedOptions extends Pick<Options, 'fileFilter' | 'limits'> {
  storageOptions?: Partial<T_S3StorageOptions>
  sharpOptions?: T_SharpOptions
}
