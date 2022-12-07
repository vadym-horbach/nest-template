import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { AdminController } from './admin.controller'
import { AuthModule } from '../auth/auth.module'
import { BlogController } from './blog.controller'

@Module({
  imports: [AuthModule],
  providers: [],
  controllers: [AdminController, UserController, BlogController],
})
export class AdminModule {}
