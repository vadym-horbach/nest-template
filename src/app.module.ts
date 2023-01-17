import { Module } from '@nestjs/common'
import { CoreModule } from './core/core.module'
import { SharedModule } from './shared/shared.module'
import { EndpointsModule } from './modules/endpoints.module'
import { JobsModule } from './jobs/jobs.module'
import { DatabaseModule } from './models/database.module'
import { SocketModule } from './providers/socket/socket.module'

@Module({
  imports: [CoreModule, DatabaseModule, SharedModule, EndpointsModule, SocketModule, JobsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
