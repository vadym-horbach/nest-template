import { Injectable } from '@nestjs/common'
import { Emitter } from '@socket.io/redis-emitter'
import IORedis from 'ioredis'
import _ from 'lodash'
import type { EventNames, EventParams } from 'socket.io/dist/typed-events'
import { ClassTransformOptions } from 'class-transformer'
import { AppConfigService } from '../../core'
import {
  AppClassSerializerInterceptor,
  SerializeGroupsEnum,
} from '../../common/serializers/responses'
import type { T_EmitEventMap } from './types'
import type { UserEntity } from '../../models'

@Injectable()
export class SocketEmitter {
  private readonly client: IORedis

  private readonly emitter: Emitter<T_EmitEventMap>

  constructor(
    private readonly configService: AppConfigService,
    private readonly classSerializer: AppClassSerializerInterceptor,
  ) {
    this.client = new IORedis({
      host: this.configService.cacheConfig.host,
      port: this.configService.cacheConfig.port,
      password: this.configService.cacheConfig.password,
      db: this.configService.cacheConfig.db,
    })
    this.emitter = new Emitter<T_EmitEventMap>(this.client)
  }

  static getUserRoom(userId: UserEntity['id']): string {
    return `user-room:${userId}`
  }

  private serializeData<Ev extends EventNames<T_EmitEventMap>>(
    args: EventParams<T_EmitEventMap, Ev>,
    options: ClassTransformOptions = {},
  ) {
    return <EventParams<T_EmitEventMap, Ev>>this.classSerializer.serialize(args, options)
  }

  sendAll<Ev extends EventNames<T_EmitEventMap>>(
    event: Ev,
    ...args: EventParams<T_EmitEventMap, Ev>
  ) {
    this.emitter.emit(event, ...this.serializeData(args))
  }

  private sendTo<Ev extends EventNames<T_EmitEventMap>>(
    rooms: string | string[],
    event: Ev,
    ...args: EventParams<T_EmitEventMap, Ev>
  ) {
    this.emitter.to(rooms).emit(event, ...this.serializeData(args))
  }

  sendToUser<Ev extends EventNames<T_EmitEventMap>>(
    userId: UserEntity['id'] | UserEntity['id'][],
    event: Ev,
    ...args: EventParams<T_EmitEventMap, Ev>
  ) {
    const rooms = _.isArray(userId)
      ? userId.map(SocketEmitter.getUserRoom)
      : SocketEmitter.getUserRoom(userId)
    this.emitter
      .to(rooms)
      .emit(event, ...this.serializeData(args, { groups: [SerializeGroupsEnum.USER] }))
  }
}
