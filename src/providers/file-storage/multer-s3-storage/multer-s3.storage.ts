import _ from 'lodash'
import crypto from 'crypto'
import type { S3 } from 'aws-sdk'
import { forkJoin, map, mapTo, Observable, of, switchMap } from 'rxjs'
import mimeTypes from 'mime-types'
import path from 'path'
import type { StorageEngine } from 'fastify-multer/lib/interfaces'
import { isOriginalPrefix, resizeImageStream } from './storage.utils'
import type {
  T_S3StorageOptions,
  T_OptionFunction,
  T_SharpOptions,
  I_FileS3,
} from './storage.types'
import type { I_FastifyRequest } from '../../../common/interfaces'

class AmazonS3Storage implements StorageEngine {
  private options: T_S3StorageOptions

  private sharpOptions?: T_SharpOptions

  constructor({ ...options }: T_S3StorageOptions, sharpOptions?: T_SharpOptions) {
    if (!options.fileStorageService) {
      throw new Error('You have to specify File Storage Service object.')
    }

    this.options = options
    this.sharpOptions = sharpOptions

    if (!this.options.bucket) {
      throw new Error('You have to specify Bucket property.')
    }
  }

  private collectParam<T>(
    req: I_FastifyRequest,
    file: I_FileS3,
    param: T_OptionFunction | undefined | T,
    defaultValue?: T,
  ): Observable<T | undefined> {
    if (!param) {
      return of(defaultValue)
    }

    if (_.isFunction(param)) {
      return new Observable((subscriber) => {
        param(req, file, (error: any, value: any) => {
          if (error) {
            subscriber.error(error)

            return
          }

          subscriber.next(value)
          subscriber.complete()
        })
      })
    }

    return of(param)
  }

  // eslint-disable-next-line no-underscore-dangle
  public _handleFile(
    req: I_FastifyRequest,
    file: I_FileS3,
    callback: (error?: any, info?: Partial<I_FileS3>) => void,
  ): void {
    forkJoin({
      replace: this.collectParam(req, file, this.options.replace),
      dynamicPath: this.collectParam(req, file, this.options.dynamicPath),
      randomFilename: this.collectParam(req, file, this.options.randomFilename),
      Bucket: <Observable<string>>this.collectParam(req, file, this.options.bucket),
      Key: <Observable<string>>this.collectParam(req, file, this.options.key),
      ACL: this.collectParam(req, file, this.options.acl),
      CacheControl: this.collectParam(req, file, this.options.cacheControl),
      ContentType: this.collectParam(
        req,
        file,
        this.options.contentType,
        file.mimetype || 'application/octet-stream',
      ),
      Metadata: this.collectParam(req, file, this.options.metadata),
      StorageClass: this.collectParam(req, file, this.options.storageClass, 'STANDARD'),
      ContentDisposition: this.collectParam(req, file, this.options.contentDisposition),
      ContentEncoding: this.collectParam(req, file, this.options.contentEncoding),
      ServerSideEncryption: this.collectParam(req, file, this.options.serverSideEncryption),
      SSEKMSKeyId: this.collectParam(req, file, this.options.SSEKMSKeyId),
    })
      .pipe(
        map((params) => {
          let fileName: string = file.originalname
          let filePath: string | null = null

          if (params.randomFilename) {
            const ext = mimeTypes.extension(file.mimetype) || path.extname(fileName)

            if (ext) {
              fileName = `${crypto.randomUUID()}.${ext}`
            } else {
              fileName = crypto.randomUUID()
            }
          }

          if (params.dynamicPath) {
            const reqParams = req.params as Record<string, any>

            if (_.isString(params.dynamicPath)) {
              filePath =
                params.dynamicPath in reqParams
                  ? `${reqParams[params.dynamicPath]}`
                  : `${params.dynamicPath}`
            } else {
              const paramDir: string[] = []
              params.dynamicPath.forEach((pathSegment) => {
                paramDir.push(pathSegment in reqParams ? `${reqParams[pathSegment]}` : pathSegment)
              })
              filePath = paramDir.join('/')
            }
          }

          const keySegments: string[] = []

          if (params.Key) {
            keySegments.push(params.Key)
          }

          if (filePath) {
            keySegments.push(filePath)
          }

          if (fileName) {
            keySegments.push(fileName)
          }

          return { ...params, Key: keySegments.join('/') }
        }),
      )
      .pipe(
        switchMap((params) => {
          if ((_.isArray(this.sharpOptions) && this.sharpOptions.length > 0) || this.sharpOptions) {
            if (_.isArray(this.sharpOptions)) {
              const originalResize = this.sharpOptions.find((e) => isOriginalPrefix(e.prefix))
              const sizes = this.sharpOptions.filter((e) => !isOriginalPrefix(e.prefix))
              const keySegments = params.Key.split('/')
              const fileName = <string>keySegments.pop()

              return forkJoin([
                this.uploadFileToS3(
                  {
                    ...params,
                    Body:
                      file.stream && originalResize
                        ? resizeImageStream(file.stream, originalResize)
                        : file.stream,
                  },
                  file,
                  params.replace,
                ),
                ...sizes.map((size) =>
                  this.uploadFileToS3(
                    {
                      ...params,
                      Key: [...keySegments, `${size.prefix}-${fileName}`].join('/'),
                      Body: file.stream ? resizeImageStream(file.stream, size) : file.stream,
                    },
                    file,
                  ),
                ),
              ]).pipe(map(([original, ...sizesFiles]) => ({ ...original, sizes: sizesFiles })))
            }

            return this.uploadFileToS3(
              {
                ...params,
                Body: file.stream ? resizeImageStream(file.stream, this.sharpOptions) : file.stream,
              },
              file,
              params.replace,
            )
          }

          return this.uploadFileToS3(
            {
              ...params,
              Body: file.stream,
            },
            file,
            params.replace,
          )
        }),
      )
      .subscribe({
        next: (uploadedFile) => {
          callback(null, uploadedFile)
        },
        error: (err) => {
          callback(err)
        },
      })
  }

  // eslint-disable-next-line no-underscore-dangle
  public _removeFile(req: I_FastifyRequest, file: I_FileS3, cb: (error: Error) => void): void {
    this.options.fileStorageService
      .remove({ Bucket: file.bucket, Key: file.key })
      .pipe(
        switchMap((res) => {
          if (file.sizes && file.sizes.length > 0) {
            return forkJoin(
              file.sizes?.map((size) =>
                this.options.fileStorageService.remove({ Bucket: size.bucket, Key: size.key }),
              ),
            ).pipe(mapTo(res))
          }

          return of(res)
        }),
      )
      .subscribe({
        error: (err) => cb(err),
      })
  }

  private uploadFileToS3(
    params: S3.PutObjectRequest,
    file: I_FileS3,
    replace: boolean = false,
  ): Observable<I_FileS3> {
    return this.options.fileStorageService.upload(params, replace).pipe(
      map((uploaded) => ({
        ...file,
        bucket: uploaded.Bucket,
        key: uploaded.Key,
        acl: params.ACL,
        contentType: params.ContentType || file.mimetype,
        contentDisposition: params.ContentDisposition,
        storageClass: params.StorageClass,
        serverSideEncryption: params.ServerSideEncryption,
        metadata: params.Metadata,
        location: uploaded.Location,
        etag: uploaded.ETag,
        size: uploaded.size,
      })),
    )
  }
}

export const multerS3Storage = (
  options: T_S3StorageOptions,
  sharpOptions?: T_SharpOptions,
): AmazonS3Storage => new AmazonS3Storage(options, sharpOptions)
