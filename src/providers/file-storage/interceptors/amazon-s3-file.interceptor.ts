import {
  CallHandler,
  ExecutionContext,
  Injectable,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import FastifyMulter from 'fastify-multer'
import { transformException } from '../multer-s3-storage/storage.utils'
import { I_MulterExtendedOptions } from '../multer-s3-storage/storage.types'
import { multerS3Storage } from '../multer-s3-storage/multer-s3.storage'
import { FileStorageService } from '../file-storage.service'
import { AppConfigService } from '../../../core'
import { I_FastifyReply, I_FastifyRequest } from '../../../common/interfaces'
import { AsyncStorageService } from '../../async-storage'

export function AmazonS3FileInterceptor(
  fieldName: string,
  localOptions?: I_MulterExtendedOptions,
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    protected multer: ReturnType<typeof FastifyMulter>

    private readonly localOptions?: I_MulterExtendedOptions

    constructor(
      private readonly fileStorageService: FileStorageService,
      private readonly asyncStorageService: AsyncStorageService,
      private readonly configService: AppConfigService,
    ) {
      this.localOptions = localOptions

      this.multer = FastifyMulter({
        ...this.localOptions,
        limits: {
          files: 1,
          // 15 mb
          fileSize: 15 * 1024 * 1024,
          ...this.localOptions?.limits,
        },
        storage: multerS3Storage(
          {
            fileStorageService,
            bucket: configService.s3Config.bucket,
            randomFilename: true,
            replace: false,
            cacheControl: 'public,max-age=31536000,s-maxage=86400,immutable',
            ...this.localOptions?.storageOptions,
          },
          this.localOptions?.sharpOptions,
        ),
      })
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp()

      await new Promise<void>((resolve, reject) => {
        // @ts-expect-error: Bad types
        this.multer.single(fieldName)(
          ctx.getRequest<I_FastifyRequest>(),
          ctx.getResponse<I_FastifyReply>(),
          (err: any) => {
            if (err) {
              const error = transformException(this.asyncStorageService.getI18n(), err)

              return reject(error)
            }

            return resolve()
          },
        )
      })

      return next.handle()
    }
  }

  return mixin(MixinInterceptor)
}
