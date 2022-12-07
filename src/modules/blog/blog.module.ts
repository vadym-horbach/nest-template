import { Module } from '@nestjs/common'
import { BlogController } from './blog.controller'

@Module({
  imports: [],
  providers: [],
  controllers: [BlogController],
  exports: [],
})
export class BlogModule {}
