import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

export class ChangeSettingsDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  escrowCreatedNotice?: boolean

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  escrowUpdatedNotice?: boolean

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  changeSettingsNotice?: boolean

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  chatMessageNotice?: boolean
}
