import { Body, Controller, HttpCode, HttpStatus, Post, SerializeOptions } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiExceptions, ApiGlobalHeaders } from '../../common/decorators/requests'
import { AuthDisable } from '../auth/auth.decorators'
import { SerializeGroupsEnum } from '../../common/serializers/responses'
import { AuthorizedResDto, LoginDto } from '../auth/dto'
import { AuthService } from '../auth/auth.service'

@ApiTags('Admin')
@ApiGlobalHeaders()
@SerializeOptions({ groups: [SerializeGroupsEnum.ADMIN] })
@Controller('admin')
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @AuthDisable()
  @ApiExceptions({
    BadRequest: 'Validation error.;Wrong credentials provided',
    Forbidden: 'You should verify your account first. We sent you a message on your email.',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthorizedResDto> {
    return this.authService.loginUser(dto, true)
  }
}
