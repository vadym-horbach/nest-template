import { ApiProperty } from '@nestjs/swagger'
import { I_FileS3 } from '../../../../core'

export class UploadImgDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image!: I_FileS3
}
