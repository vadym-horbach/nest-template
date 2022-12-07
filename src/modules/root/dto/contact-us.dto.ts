import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator'

export class ContactUsDto {
  @ApiProperty()
  @IsString()
  @Length(1, 63)
  @IsNotEmpty()
  name!: string

  @ApiProperty()
  @IsString()
  @Length(1, 63)
  @IsOptional()
  company?: string

  @ApiProperty({ example: '+41446681800' })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber!: string

  @ApiProperty({ example: 'example@mail.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message!: string
}
