import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum EmailCodeTypesEnum {
  CURRENT = 'current',
  NEW = 'new',
}

export class ChangeEmailCodesDto {
  @ApiProperty()
  @IsEnum(EmailCodeTypesEnum)
  @IsOptional()
  type?: EmailCodeTypesEnum

  @ApiProperty({ example: 'example@mail.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string
}

export class ConfirmChangeEmailCodesDto {
  @ApiProperty()
  @IsEnum(EmailCodeTypesEnum)
  @IsOptional()
  type!: EmailCodeTypesEnum

  @ApiProperty({ example: '5997XF' })
  @IsString()
  @IsNotEmpty()
  code!: string
}
