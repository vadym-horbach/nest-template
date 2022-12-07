import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { EntityWithId } from '../../abstract/entity'
import type { ChatEntity } from '../entity'
import type { UserEntity } from '../../user'

@Exclude()
@Entity('chat_participants')
export class ParticipantEntity extends EntityWithId {
  @ApiProperty({ example: 1 })
  @Expose()
  @Column()
  chatId!: ChatEntity['id']

  @ApiHideProperty()
  @Exclude()
  @ManyToOne('ChatEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat!: ChatEntity

  @ApiProperty({ example: 1 })
  @Expose()
  @Column()
  userId!: UserEntity['id']

  @ApiHideProperty()
  @Exclude()
  @ManyToOne('UserEntity', { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity

  @Expose()
  @Column({ nullable: true })
  lastRead?: Date
}
