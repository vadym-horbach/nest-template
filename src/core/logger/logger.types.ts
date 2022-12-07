import type { AxiosError } from 'axios'

export type T_MessageType = Record<string, any> | Error | string | AxiosError
export type T_GenerateMetaOptions = {
  message: T_MessageType
  context?: string
  trace?: string
}
export type T_Meta = {
  message: string
  [key: string]: any
}
