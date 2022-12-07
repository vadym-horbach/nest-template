import { IsEmail, IsNotEmpty, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { BaseDto } from '../../../common/serializers/responses'
import { UserEntity } from '../../../models'
import { IsPassword } from '../../../common/decorators/validation'

export class LoginDto {
  @ApiProperty({ example: 'example@mail.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @ApiProperty({ example: '#Pass$123' })
  @IsPassword()
  @IsNotEmpty()
  password!: string
}

export class AuthorizedResDto extends BaseDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => UserEntity)
  user!: UserEntity

  @ApiProperty()
  accessToken!: string

  @ApiProperty()
  refreshToken!: string
}
