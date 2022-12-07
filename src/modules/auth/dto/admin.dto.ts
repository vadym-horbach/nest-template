import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { IsBooleanLike } from '../../../common/decorators/validation'

export class AdminDto {
  @ApiProperty({ required: false })
  @IsBooleanLike()
  @IsOptional()
  admin: boolean = false
}
