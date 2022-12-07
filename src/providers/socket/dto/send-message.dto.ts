import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatName!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string
}
