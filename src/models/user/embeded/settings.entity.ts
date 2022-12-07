import { Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class SettingsEntity {
  @ApiProperty()
  @Expose()
  @Column({ default: true })
  escrowCreatedNotice: boolean = true

  @ApiProperty()
  @Expose()
  @Column({ default: true })
  escrowUpdatedNotice: boolean = true

  @ApiProperty()
  @Expose()
  @Column({ default: true })
  changeSettingsNotice: boolean = true

  @ApiProperty()
  @Expose()
  @Column({ default: true })
  chatMessageNotice: boolean = true
}
