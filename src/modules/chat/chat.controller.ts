import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import { I18n, I_I18nContext } from 'nestjs-i18n'
import { ApiGlobalHeaders } from '../../common/decorators/requests'
import { CurrentUser } from '../auth/auth.decorators'
import { ChatEntity, ChatRepository, MessageRepository, UserEntity } from '../../models'
import { ChatFiltersDto, ListChatsDto } from './dto/list-chats'

@ApiBearerAuth()
@ApiTags('Chats')
@ApiGlobalHeaders()
@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  @Get(':chatName')
  async chatInfo(
    @CurrentUser() user: UserEntity,
    @Param('chatName') name: string,
    @I18n() i18n: I_I18nContext,
  ): Promise<ChatEntity> {
    const chat = await this.chatRepository.findOne({
      where: { name, participants: { userId: user.id } },
    })

    if (!chat) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundChat'))
    }

    return chat
  }

  @Get(':chatName/messages')
  async listMessages(
    @CurrentUser() user: UserEntity,
    @Param('chatName') name: string,
    @Query() filters: ChatFiltersDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<ListChatsDto> {
    const chat = await this.chatRepository.findOne({
      where: { name, participants: { userId: user.id } },
    })

    if (!chat) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundChat'))
    }

    const total = await this.messageRepository.count({ where: { chatId: chat.id } })

    const [data, count] = await this.messageRepository.findAndCount({
      where: { chatId: chat.id },
      order: { [filters.orderBy]: filters.order },
      skip: (filters.page - 1) * filters.size,
      take: filters.size,
    })

    return { total, count, data }
  }
}
