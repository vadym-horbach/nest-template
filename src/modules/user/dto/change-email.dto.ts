import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ChangeEmailDto {
  @ApiProperty({ example: 'ef74XN' })
  @IsString()
  @IsNotEmpty()
  currentCode!: string

  @ApiProperty({ example: '5997XF' })
  @IsString()
  @IsNotEmpty()
  newCode!: string
}
