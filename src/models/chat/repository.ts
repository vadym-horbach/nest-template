import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { ChatEntity } from './entity'
import { BasicRepository } from '../abstract/repository'

@Injectable()
export class ChatRepository extends BasicRepository<ChatEntity> {
  constructor(
    @InjectRepository(ChatEntity)
    protected readonly repository: Repository<ChatEntity>,
  ) {
    super()
  }
}
