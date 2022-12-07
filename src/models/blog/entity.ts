import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { EntityWithUUID } from '../abstract/entity'
import type { UserEntity } from '../user'

@Exclude()
@Entity('blog-posts')
export class BlogPostEntity extends EntityWithUUID {
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
  @Column({ nullable: true })
  imageUrl?: string

  @ApiProperty()
  @Expose()
  @Column()
  title!: string

  @ApiProperty()
  @Expose()
  @Column()
  description!: string
}
