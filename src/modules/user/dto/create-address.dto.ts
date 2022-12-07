import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAddressDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isDefault: boolean = false

  @ApiProperty({ example: 'USA' })
  @IsString()
  @IsNotEmpty()
  country!: string

  @ApiProperty({ example: 'US' })
  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
  postCode!: string

  @ApiProperty({ example: 'Hillbrook Dr Steet 3505' })
  @IsString()
  @IsNotEmpty()
  street!: string

  @ApiProperty({ example: '2nd Work' })
  @IsString()
  @IsNotEmpty()
  address!: string

  @ApiProperty({ example: '02' })
  @IsString()
  @IsOptional()
  apartments?: string
}
