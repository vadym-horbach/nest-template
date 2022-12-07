import { Type } from '@nestjs/common'
import { BasicEntity } from './abstract/entity'
import { BasicRepository } from './abstract/repository'
import { UserEntity, UserRepository } from './user'
import { AddressEntity, AddressRepository } from './address'
import {
  ChatEntity,
  ChatRepository,
  MessageEntity,
  MessageRepository,
  ParticipantEntity,
  ParticipantRepository,
} from './chat'
import { BlogPostEntity, BlogPostRepository } from './blog'

export const entities: Type<BasicEntity>[] = [
  UserEntity,
  AddressEntity,
  ChatEntity,
  ParticipantEntity,
  MessageEntity,
  BlogPostEntity,
]
export const repositories: Type<BasicRepository<any>>[] = [
  UserRepository,
  AddressRepository,

  ChatRepository,
  ParticipantRepository,
  MessageRepository,
  BlogPostRepository,
]
export {
  UserEntity,
  UserRepository,
  AddressEntity,
  AddressRepository,
  ChatEntity,
  ChatRepository,
  ParticipantEntity,
  ParticipantRepository,
  MessageEntity,
  MessageRepository,
  BlogPostEntity,
  BlogPostRepository,
}
