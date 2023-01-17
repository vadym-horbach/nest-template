import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type SocketIO from 'socket.io'
import {
  NotFoundException,
  UnauthorizedException,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import _ from 'lodash'
import { I_18nContext } from 'nestjs-i18n'
import type { T_AuthorizedSocket, T_EmitEventMap, T_ListenEventMap } from './types'
import { EventsEnum } from './types'
import { AuthService } from '../../modules/auth/auth.service'
import { SocketEmitter } from './socket.emitter'
import { ChatRepository, MessageRepository, ParticipantRepository } from '../../models'
import { WsExceptionFilter } from './ws-exception.filter'
import { exceptionFactory } from '../../common/serializers/exceptions'
import { SendMessageDto } from './dto/send-message.dto'
import { AsyncStorageService } from '../../core'
import { ViewMessagesDto } from './dto/view-messages.dto'

@UseFilters(WsExceptionFilter)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidUnknownValues: true,
    validationError: { target: true, value: true },
    stopAtFirstError: true,
    exceptionFactory,
  }),
)
@WebSocketGateway()
export class RootGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: SocketIO.Server<T_ListenEventMap, T_EmitEventMap>

  private readonly i18n: I_18nContext

  constructor(
    private readonly authService: AuthService,
    private readonly chatRepository: ChatRepository,
    private readonly participantRepository: ParticipantRepository,
    private readonly messageRepository: MessageRepository,
    private readonly socketEmitter: SocketEmitter,
    private readonly asyncStorageService: AsyncStorageService,
  ) {
    // TODO Check translation
    this.i18n = asyncStorageService.getI18n()
  }

  protected async connectUser(ipmClient: T_AuthorizedSocket) {
    const jwtToken = ipmClient.handshake.query['token']

    if (!jwtToken) {
      throw new UnauthorizedException(this.i18n.t('errors.unauthorized.tokenNotProvided'))
    }

    if (!_.isString(jwtToken)) {
      throw new UnauthorizedException(this.i18n.t('errors.unauthorized.tokenNotValid'))
    }

    const user = await this.authService.findUserByToken(jwtToken)

    if (!user.isVerifiedEmail) {
      throw new UnauthorizedException(
        this.i18n.t('errors.imATeapot.shouldVerify', { lang: user.language }),
      )
    }

    ipmClient.userId = user.id
    await ipmClient.join(SocketEmitter.getUserRoom(ipmClient.userId))
  }

  async handleConnection(client: T_AuthorizedSocket): Promise<void> {
    try {
      await this.connectUser(client)
    } catch (e: any) {
      const wsExceptionFilter = new WsExceptionFilter()
      wsExceptionFilter.handleError(client, e)
    }
  }

  @SubscribeMessage(EventsEnum.SEND_MESSAGE)
  async handleMessages(
    @MessageBody() { chatName, body }: SendMessageDto,
    @ConnectedSocket() client: T_AuthorizedSocket,
  ) {
    const chat = await this.chatRepository.findOne({
      where: { name: chatName, participants: { userId: client.userId } },
    })

    if (!chat) {
      throw new NotFoundException(
        this.i18n.t('errors.notFound.notFoundChat', { lang: client.language }),
      )
    }

    await this.messageRepository.create({ userId: client.userId, chat, body }).save()
  }

  @SubscribeMessage(EventsEnum.VIEW_MESSAGES)
  async viewMessages(
    @MessageBody() { chatName }: ViewMessagesDto,
    @ConnectedSocket() client: T_AuthorizedSocket,
  ) {
    const participant = await this.participantRepository.findOne({
      where: { userId: client.userId, chat: { name: chatName } },
      relations: { chat: true },
    })

    if (!participant) {
      throw new NotFoundException(
        this.i18n.t('errors.notFound.notFoundChat', { lang: client.language }),
      )
    }

    participant.lastRead = new Date()
    await participant.save()
    await participant.chat.reload()

    this.socketEmitter.sendToUser(client.userId, EventsEnum.VIEWED_MESSAGES, participant.chat)
  }
}
