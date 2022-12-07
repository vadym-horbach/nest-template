import { BasePaginatedDto } from '../../../../common/serializers/responses'
import { UserEntity } from '../../../../models'

export class ListUsersDto extends BasePaginatedDto {
  data!: UserEntity[]
}
