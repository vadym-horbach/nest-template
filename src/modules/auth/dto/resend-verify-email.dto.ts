import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsJWT, IsNotEmpty } from 'class-validator'
import { IsPassword, ValidateIfNullable } from '../../../common/decorators/validation'

export class ResendVerifyEmailDto {
  @ApiProperty()
  @ValidateIfNullable(({ code, email, password }) => code || (!email && !password))
  @IsJWT()
  @IsNotEmpty()
  code?: string

  @ApiProperty({ example: 'example@mail.com' })
  @ValidateIfNullable(({ code }) => !code)
  @IsNotEmpty()
  @IsEmail()
  email?: string

  @ApiProperty()
  @ValidateIfNullable(({ code }) => !code)
  @IsPassword()
  @IsNotEmpty()
  password?: string
}
