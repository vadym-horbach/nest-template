import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { EntityWithId } from '../abstract/entity'
import type { UserEntity } from '../user'

@Exclude()
@Entity('users_addresses')
export class AddressEntity extends EntityWithId {
  @ApiProperty({ example: 1 })
  @Expose()
  @Column()
  userId!: UserEntity['id']

  @ApiHideProperty()
  @Exclude()
  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity

  @ApiProperty()
  @Expose()
  @Column({ default: false })
  isDefault: boolean = false

  @ApiProperty({ example: 'USA' })
  @Expose()
  @Column()
  country!: string

  @ApiProperty({ example: 'US' })
  @Expose()
  @Column()
  countryCode!: string

  @ApiProperty({ example: 'Austin' })
  @Expose()
  @Column({ nullable: true })
  city?: string

  @ApiProperty({ example: 'Texas' })
  @Expose()
  @Column({ nullable: true })
  state?: string

  @ApiProperty({ example: '3505' })
  @Expose()
  @Column()
  postCode!: string

  @ApiProperty({ example: 'Hillbrook Dr Steet 3505' })
  @Expose()
  @Column()
  street!: string

  @ApiProperty({ example: '2nd Work' })
  @Expose()
  @Column()
  address!: string

  @ApiProperty({ example: '02' })
  @Expose()
  @Column({ nullable: true })
  apartments?: string
}
