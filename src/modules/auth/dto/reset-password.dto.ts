import { ApiProperty } from '@nestjs/swagger'
import { IsJWT, IsNotEmpty } from 'class-validator'
import { IsPassword } from '../../../common/decorators/validation'

export class ResetPasswordDto {
  @ApiProperty()
  @IsJWT()
  @IsNotEmpty()
  code!: string

  @ApiProperty({ example: '#Pass$123' })
  @IsPassword()
  @IsNotEmpty()
  password!: string
}
