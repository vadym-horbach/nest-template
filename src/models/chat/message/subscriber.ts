import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm'
import { SocketEmitter } from '../../../providers/socket'
import { EventsEnum } from '../../../providers/socket/types'
import { MessageEntity } from './entity'
import { ChatRepository } from '../repository'

@EventSubscriber()
export class MessageSubscriber implements EntitySubscriberInterface<MessageEntity> {
  constructor(
    dataSource: DataSource,
    private readonly socketEmitter: SocketEmitter,
    private readonly chatRepository: ChatRepository,
  ) {
    dataSource.subscribers.push(this)
  }

  listenTo() {
    return MessageEntity
  }

  async afterInsert({ entity }: InsertEvent<MessageEntity>): Promise<any> {
    if (entity) {
      const chat = await this.chatRepository.findById(entity.chatId)

      if (chat) {
        chat.participants.forEach((el) => {
          const response = { chat, message: entity }

          if (el.userId === entity.userId) {
            this.socketEmitter.sendToUser(el.userId, EventsEnum.CREATED_MESSAGE, response)
          } else {
            this.socketEmitter.sendToUser(el.userId, EventsEnum.RECEIVE_MESSAGE, response)
          }
        })
      }
    }
  }
}
