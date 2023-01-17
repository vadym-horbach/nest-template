import { Module } from '@nestjs/common'
import { AppLoggerService } from './logger.service'

@Module({
  imports: [],
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}
