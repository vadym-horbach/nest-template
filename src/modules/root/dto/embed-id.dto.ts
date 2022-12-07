import { ApiProperty } from '@nestjs/swagger'

export class EmbedIdDto {
  @ApiProperty()
  accessToken!: string
}
