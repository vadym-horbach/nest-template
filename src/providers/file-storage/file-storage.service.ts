import { Injectable } from '@nestjs/common'
import { S3 } from 'aws-sdk'
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  concatAll,
  from,
  throwError,
} from 'rxjs'
import _ from 'lodash'
import { T_DeleteObjectRequest, T_PutObjectRequest, T_S3UploadedFile } from './file-storage.types'
import { AppLoggerService, AppConfigService } from '../../core'

@Injectable()
export class FileStorageService {
  private readonly s3: S3

  constructor(
    private readonly config: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(FileStorageService.name)
    this.s3 = new S3({
      region: config.s3Config.awsRegion,
      accessKeyId: config.s3Config.awsAccessKey,
      secretAccessKey: config.s3Config.awsSecretKey,
    })
  }

  private getDirPrefixes(
    Bucket: string,
    path: string,
    Delimiter: string = '/',
  ): Observable<string[]> {
    return new Observable<{ keyList: string[]; prefixList: string[] }>((subscriber) => {
      const dirPrefix = path === '/' ? undefined : `${_.trim(path, '/')}/`
      this.s3.listObjectsV2({ Bucket, Prefix: dirPrefix, Delimiter }, (err, data) => {
        if (err) return subscriber.error(err)

        const keyList: string[] = []
        const prefixList: string[] = []

        if (
          (data.Contents && data.Contents.length > 0) ||
          (data.CommonPrefixes && data.CommonPrefixes.length > 0)
        ) {
          data.Contents?.forEach(({ Key }) => !!Key && keyList.push(Key))
          data.CommonPrefixes?.forEach(({ Prefix }) => !!Prefix && prefixList.push(Prefix))
        }

        subscriber.next({ keyList, prefixList })

        return subscriber.complete()
      })
    }).pipe(
      switchMap(({ keyList, prefixList }) => {
        if (prefixList.length) {
          return forkJoin(
            prefixList.map((prefix) => this.getDirPrefixes(Bucket, prefix, Delimiter)),
          ).pipe(
            concatAll(),
            map((keys) => {
              return [...keyList, ...keys]
            }),
          )
        }

        return of(keyList)
      }),
    )
  }

  private uploadFile(params: S3.PutObjectRequest): Observable<T_S3UploadedFile> {
    return new Observable((subscriber) => {
      let currentSize = 0

      const upload = this.s3.upload(params)
      upload.on('httpUploadProgress', (event) => {
        if (event.total) {
          currentSize = event.total
        }
      })
      upload.send((error, uploadedData) => {
        if (error) return subscriber.error(error)
        subscriber.next({ ...uploadedData, size: currentSize })

        return subscriber.complete()
      })
    })
  }

  upload(options: T_PutObjectRequest, replace: boolean = false): Observable<T_S3UploadedFile> {
    const params = {
      ...options,
      Bucket: options.Bucket || this.config.s3Config.bucket,
    }

    if (replace) {
      const keyFragments = params.Key.split('/')
      const filename = keyFragments.pop()
      const removeKey = keyFragments.length ? keyFragments.join('/') : String(filename)

      return this.remove({
        Bucket: params.Bucket,
        Key: removeKey,
      }).pipe(
        catchError((err) => {
          this.logger.error(err)

          return of(null)
        }),
        switchMap(() => this.uploadFile(params)),
      )
    }

    return this.uploadFile(params)
  }

  remove(
    options: T_DeleteObjectRequest,
    ignoreErr: boolean = false,
  ): Observable<S3.Types.DeleteObjectOutput> {
    const params = {
      ...options,
      Bucket: options.Bucket || this.config.s3Config.bucket,
    }

    return this.getDirPrefixes(params.Bucket, params.Key).pipe(
      switchMap((keys) => {
        if (keys.length) {
          return from(
            this.s3
              .deleteObjects({
                Bucket: params.Bucket,
                Delete: { Objects: keys.map((Key) => ({ Key })) },
              })
              .promise(),
          ).pipe(
            map((result) => ({
              DeleteMarker: result.Deleted?.[0]?.DeleteMarker,
              VersionId: result.Deleted?.[0]?.VersionId,
              RequestCharged: result.RequestCharged,
            })),
          )
        }

        return from(this.s3.deleteObject(params).promise())
      }),
      catchError((err) => {
        if (ignoreErr) {
          return of({})
        }

        return throwError(err)
      }),
    )
  }
}
