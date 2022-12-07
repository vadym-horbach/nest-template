import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { StatusDto } from '../../common/serializers/responses'
import { AuthDisable } from '../auth/auth.decorators'
import { ApiGlobalHeaders } from '../../common/decorators/requests'

@ApiTags('Root')
@ApiGlobalHeaders()
@Controller()
export class RootController {
  @Throttle(1, 1)
  @AuthDisable()
  @Get()
  async health(): Promise<StatusDto> {
    return { status: 'ok' }
  }
}
