import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppConfigService } from '../core'
import { entities, repositories } from './index'
import { getDbConfig } from './ormconfig'
import { MessageSubscriber } from './chat/message/subscriber'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => getDbConfig(configService.database),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [...repositories, MessageSubscriber],
  exports: repositories,
})
export class DatabaseModule {}
