import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export abstract class BaseDto {}

export class StatusDto extends BaseDto {
  @ApiProperty({ example: 'ok' })
  status!: string
}
export class IDDto extends BaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  id!: number
}
export class UUIDDto extends BaseDto {
  @ApiProperty({ example: '21096b94498f4a2d9795e810edc2c9a9' })
  @IsString()
  @IsNotEmpty()
  id!: string
}
export class BasePaginatedFiltersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  size: number = 100

  @ApiProperty({ required: false })
  @IsOptional()
  @IsIn(['id', 'createdAt', 'updatedAt'])
  @IsString()
  orderBy: string = 'id'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  @IsString()
  order: string = 'desc'
}
export abstract class BasePaginatedDto extends BaseDto {
  @ApiProperty({ example: 1000 })
  total!: number

  @ApiProperty({ example: 100 })
  count!: number

  abstract data: any[]
}
