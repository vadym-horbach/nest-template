import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller'

@Module({
  imports: [],
  providers: [],
  controllers: [ChatController],
  exports: [],
})
export class ChatModule {}
