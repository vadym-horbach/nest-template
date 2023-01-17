import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AsyncStorageService } from './async-storage.service'

@Module({
  providers: [AsyncStorageService],
  exports: [AsyncStorageService],
})
export class AsyncStorageModule implements NestModule {
  constructor(private readonly asyncStorage: AsyncStorageService) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply((request: any, response: any, next: any) => {
        this.asyncStorage.getAsyncStorage().run(AsyncStorageService.getInitialStore(), () => {
          this.asyncStorage.setRequestID(request.id)
          next()
        })
      })
      .forRoutes('*')
  }
}
