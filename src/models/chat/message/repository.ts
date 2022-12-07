import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { MessageEntity } from './entity'
import { BasicRepository } from '../../abstract/repository'

@Injectable()
export class MessageRepository extends BasicRepository<MessageEntity> {
  constructor(
    @InjectRepository(MessageEntity)
    protected readonly repository: Repository<MessageEntity>,
  ) {
    super()
  }
}
