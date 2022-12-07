import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { AppCacheModule } from '../../providers/cache/cache.module'
import { AuthGuard } from './guards'

@Module({
  imports: [AppCacheModule],
  providers: [AuthGuard, AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
