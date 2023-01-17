import { S3 } from 'aws-sdk'
import type { Options } from 'fastify-multer/lib/interfaces'
import { T_WithPartial } from '../../common/interfaces'

export type T_Filters = {
  image: Options['fileFilter']
}

export type T_S3UploadedFile = S3.ManagedUpload.SendData & { size: number }
export type T_S3ResidedFile = T_S3UploadedFile & { Sizes?: T_S3UploadedFile[] }
export type T_PutObjectRequest = T_WithPartial<S3.PutObjectRequest, 'Bucket'>
export type T_DeleteObjectRequest = T_WithPartial<S3.DeleteObjectRequest, 'Bucket'>
