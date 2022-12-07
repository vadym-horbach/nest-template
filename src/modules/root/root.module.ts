import { Module } from '@nestjs/common'
import { RootController } from './root.controller'

@Module({
  imports: [],
  providers: [],
  controllers: [RootController],
})
export class RootModule {}
