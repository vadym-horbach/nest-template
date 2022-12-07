import { IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BaseDto } from '../../../common/serializers/responses'

export class OauthUrlDto {
  @ApiProperty({ example: 'http://localhost:3000' })
  @IsOptional()
  @IsString()
  redirectUrl?: string

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  loginHint?: string
}

export class AuthUrlResDto extends BaseDto {
  @ApiProperty({ example: 'https://accounts.google.com/o/oauth2/v2/auth' })
  url!: string
}
