import { IsIn, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BasePaginatedDto, BasePaginatedFiltersDto } from '../../../common/serializers/responses'
import { BlogPostEntity } from '../../../models'

export class BlogFiltersDto extends BasePaginatedFiltersDto {
  @ApiProperty({ required: false })
  @IsIn(['id', 'createdAt', 'updatedAt'])
  @IsString()
  @IsOptional()
  orderBy: string = 'id'

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string
}

export class ListBlogsDto extends BasePaginatedDto {
  data!: BlogPostEntity[]
}
