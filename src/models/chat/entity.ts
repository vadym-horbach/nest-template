import { Column, Entity, OneToMany } from 'typeorm'
import { Exclude, Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { EntityWithId } from '../abstract/entity'
import type { ParticipantEntity } from './participant/entity'
import { MessageEntity } from './message/entity'

@Exclude()
@Entity('chats')
export class ChatEntity extends EntityWithId {
  @ApiProperty()
  @Expose()
  @Column()
  name!: string

  @ApiProperty()
  @Expose()
  @OneToMany('ParticipantEntity', 'chat', { eager: true, cascade: true })
  participants!: ParticipantEntity[]

  @ApiProperty()
  @Expose()
  @OneToMany('MessageEntity', 'chat', { cascade: true })
  messages!: MessageEntity[]
}
