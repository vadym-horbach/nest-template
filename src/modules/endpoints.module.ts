import { Module } from '@nestjs/common'
import { RootModule } from './root/root.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { AdminModule } from './admin/admin.module'
import { ChatModule } from './chat/chat.module'
import { BlogModule } from './blog/blog.module'

@Module({
  imports: [RootModule, AuthModule, UserModule, AdminModule, ChatModule, BlogModule],
  controllers: [],
  providers: [],
})
export class EndpointsModule {}
