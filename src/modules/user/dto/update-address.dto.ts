import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateAddressDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isDefault: boolean = false

  @ApiProperty({ example: 'USA' })
  @IsString()
  @IsOptional()
  country!: string

  @ApiProperty({ example: 'US' })
  @IsString()
  @IsOptional()
  countryCode!: string

  @ApiProperty({ example: 'Austin' })
  @IsString()
  @IsOptional()
  city?: string

  @ApiProperty({ example: 'Texas' })
  @IsString()
  @IsOptional()
  state?: string

  @ApiProperty({ example: '3505' })
  @IsString()
  @IsOptional()
  postCode!: string

  @ApiProperty({ example: 'Hillbrook Dr Steet 3505' })
  @IsString()
  @IsOptional()
  street!: string

  @ApiProperty({ example: '2nd Work' })
  @IsString()
  @IsOptional()
  address!: string

  @ApiProperty({ example: '02' })
  @IsString()
  @IsOptional()
  apartments?: string
}
