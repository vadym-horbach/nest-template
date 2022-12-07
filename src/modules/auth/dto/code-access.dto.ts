import { IsJWT, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CodeAccessDto {
  @ApiProperty()
  @IsJWT()
  @IsNotEmpty()
  code!: string
}
