import { Module } from '@nestjs/common'
import { PubSubManager } from './pubSub.manager'

@Module({
  imports: [],
  controllers: [],
  providers: [PubSubManager],
  exports: [PubSubManager],
})
export class PubSubModule {}
