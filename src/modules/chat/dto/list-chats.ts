import { IsIn, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BasePaginatedDto, BasePaginatedFiltersDto } from '../../../common/serializers/responses'
import { MessageEntity } from '../../../models'

export class ChatFiltersDto extends BasePaginatedFiltersDto {
  @ApiProperty({ required: false })
  @IsIn(['id', 'createdAt', 'updatedAt'])
  @IsString()
  @IsOptional()
  orderBy: string = 'id'
}

export class ListChatsDto extends BasePaginatedDto {
  data!: MessageEntity[]
}
