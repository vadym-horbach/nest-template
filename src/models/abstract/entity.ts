import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeormBaseEntity,
  PrimaryColumn,
} from 'typeorm'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export abstract class BasicEntity extends TypeormBaseEntity {
  abstract id: any
}
export abstract class EntityWithId extends BasicEntity {
  @ApiProperty({ example: 1 })
  @Expose()
  @PrimaryGeneratedColumn()
  id!: number

  @ApiProperty()
  @Expose()
  @CreateDateColumn()
  createdAt!: Date

  @ApiProperty()
  @Expose()
  @UpdateDateColumn()
  updatedAt!: Date
}
export abstract class EntityWithUUID extends BasicEntity {
  @ApiProperty({ example: '21096b94498f4a2d9795e810edc2c9a9' })
  @Expose()
  @PrimaryColumn({
    type: 'uuid',
    generated: 'uuid',
    transformer: {
      from: (text) => (text ? text.replaceAll(/-/g, '') : text),
      to: (value) => value,
    },
  })
  id!: string

  @ApiProperty()
  @Expose()
  @CreateDateColumn()
  createdAt!: Date

  @ApiProperty()
  @Expose()
  @UpdateDateColumn()
  updatedAt!: Date
}
