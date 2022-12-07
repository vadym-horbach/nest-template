import type SocketIO from 'socket.io'
import type { AddressEntity, UserEntity, ChatEntity, MessageEntity } from '../../models'

export type T_Exception = { statusCode: number; message: string; error?: string }
export type T_KickedException = { statusCode: number; reason: string; error?: string }
export enum EventsEnum {
  KICKED = 'kicked',
  EXCEPTION = 'exception',
  NOTIFICATION = 'notification',
  UPDATE_CURRENT_USER = 'update_current_user',
  CREATE_ADDRESS = 'create_address',
  UPDATE_ADDRESS = 'update_address',
  DELETE_ADDRESS = 'delete_address',
  COMPLETE_KYC = 'complete_kyc',
  SEND_MESSAGE = 'send_message',
  VIEW_MESSAGES = 'view_messages',
  VIEWED_MESSAGES = 'viewed_messages',
  RECEIVE_MESSAGE = 'receive_message',
  CREATED_MESSAGE = 'created_message',
}
export type T_ListenEventMap = {
  [EventsEnum.SEND_MESSAGE]: (...args: any[]) => void
  [EventsEnum.VIEW_MESSAGES]: (...args: any[]) => void
  [event: string]: (...args: any[]) => void
}
type T_MessageRes = {
  chat: ChatEntity
  message: MessageEntity
}
export type T_EmitEventMap = {
  [EventsEnum.KICKED]: (data: T_KickedException) => void
  [EventsEnum.EXCEPTION]: (...args: any[]) => void
  [EventsEnum.NOTIFICATION]: (notification: Record<string, any>) => void
  [EventsEnum.UPDATE_CURRENT_USER]: (user: UserEntity) => void
  [EventsEnum.CREATE_ADDRESS]: (user: AddressEntity) => void
  [EventsEnum.UPDATE_ADDRESS]: (user: AddressEntity) => void
  [EventsEnum.DELETE_ADDRESS]: (user: AddressEntity) => void
  [EventsEnum.RECEIVE_MESSAGE]: (body: T_MessageRes) => void
  [EventsEnum.CREATED_MESSAGE]: (body: T_MessageRes) => void
  [EventsEnum.VIEWED_MESSAGES]: (chat: ChatEntity) => void
  [event: string]: (...args: any[]) => void
}
export type T_AuthorizedSocket = SocketIO.Socket<T_ListenEventMap, T_EmitEventMap> & {
  userId: UserEntity['id']
  language: UserEntity['language']
}
