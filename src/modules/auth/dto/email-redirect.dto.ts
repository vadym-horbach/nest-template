import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsUrl } from 'class-validator'

export class EmailRedirectDto {
  @ApiProperty({ default: null })
  @IsUrl({ require_tld: false })
  @IsOptional()
  emailRedirect?: string
}
