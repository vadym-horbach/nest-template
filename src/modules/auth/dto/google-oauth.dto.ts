import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class GoogleOauthDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code!: string

  @ApiProperty({ example: 'http://localhost:3000' })
  @IsOptional()
  @IsString()
  redirectUrl?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  state?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  scope?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  hd?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  prompt?: string
}
