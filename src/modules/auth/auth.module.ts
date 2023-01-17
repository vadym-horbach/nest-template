import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { AuthGuard } from './guards'

@Module({
  imports: [],
  providers: [AuthGuard, AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
