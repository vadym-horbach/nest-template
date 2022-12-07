import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ViewMessagesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatName!: string
}
