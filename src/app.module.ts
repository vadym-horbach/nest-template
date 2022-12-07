import { Module } from '@nestjs/common'
import { CoreModule } from './core/core.module'
import { AppCacheModule } from './providers/cache/cache.module'
import { SharedModule } from './shared/shared.module'
import { EndpointsModule } from './modules/endpoints.module'
import { JobsModule } from './jobs/jobs.module'
import { DatabaseModule } from './models/database.module'
import { SocketModule } from './providers/socket/socket.module'
import { AsyncStorageModule } from './providers/async-storage/async-storage.module'
import { FileStorageModule } from './providers/file-storage/file-storage.module'

@Module({
  imports: [
    CoreModule,
    DatabaseModule,
    AppCacheModule,
    FileStorageModule,
    SharedModule,
    AsyncStorageModule,
    EndpointsModule,
    SocketModule,
    JobsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
