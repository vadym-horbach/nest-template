import { IoAdapter } from '@nestjs/platform-socket.io'
import { INestApplicationContext } from '@nestjs/common'
import type SocketIO from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import IORedis from 'ioredis'
import { AppConfigService } from '../../core'

export class SocketAdapter extends IoAdapter {
  private readonly appConfigService: AppConfigService

  private readonly pubClient: IORedis

  private readonly subClient: IORedis

  constructor(private readonly app: INestApplicationContext) {
    super(app)
    this.appConfigService = app.get(AppConfigService)
    this.pubClient = new IORedis({
      host: this.appConfigService.cacheConfig.host,
      port: this.appConfigService.cacheConfig.port,
      password: this.appConfigService.cacheConfig.password,
      db: this.appConfigService.cacheConfig.db,
    })
    this.subClient = this.pubClient.duplicate()
  }

  createIOServer(port: number, options?: SocketIO.ServerOptions): SocketIO.Server {
    return <SocketIO.Server>super.createIOServer(port, <SocketIO.ServerOptions>{
      ...options,
      cors: {
        origin: this.appConfigService.corsOrigins,
        methods: ['GET', 'POST'],
        maxAge: 86400, // 24 hours
        credentials: true,
      },
      transports: ['websocket'],
      adapter: createAdapter(this.pubClient, this.subClient),
    })
  }
}
