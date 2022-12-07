import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

class UserNameDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName!: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName!: string
}
class UserDto {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserNameDto)
  name!: UserNameDto

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email!: string
}
class AuthorizationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code!: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  id_token?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  state?: string
}
export class AppleOauthDto {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthorizationDto)
  authorization!: AuthorizationDto

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto
}
