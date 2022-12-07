import { IsIn, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BasePaginatedFiltersDto } from '../../../common/serializers/responses'
import { IsBooleanLike } from '../../../common/decorators/validation'

export class UserFiltersDto extends BasePaginatedFiltersDto {
  @ApiProperty({ required: false })
  @IsIn([
    'id',
    'createdAt',
    'updatedAt',
    'accountType',
    'language',
    'lastActivities',
    'role',
    'email',
    'isVerifiedEmail',
    'isVerifiedKYC',
    'businessName',
  ])
  @IsString()
  @IsOptional()
  orderBy: string = 'id'

  @ApiProperty({ required: false })
  @IsBooleanLike()
  @IsOptional()
  admin: boolean = false

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string
}
