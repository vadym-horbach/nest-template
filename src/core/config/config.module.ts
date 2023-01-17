import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { validate } from './config.validate'
import { AppConfigService } from './config.service'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, cache: true, validate })],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
