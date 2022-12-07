import { Global, Module } from '@nestjs/common'
import { RootGateway } from './root.gateway'
import { AuthModule } from '../../modules/auth/auth.module'
import { SocketEmitter } from './socket.emitter'
import { CoreModule } from '../../core/core.module'

@Global()
@Module({
  imports: [AuthModule, CoreModule],
  controllers: [],
  providers: [RootGateway, SocketEmitter],
  exports: [SocketEmitter],
})
export class SocketModule {}
