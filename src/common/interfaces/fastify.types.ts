import type { FastifyRequest, FastifyReply } from 'fastify'
import { HEADER_AUTHORIZATION, HEADER_LANGUAGE, HEADER_REQUEST_ID } from '../constants'

export interface I_FastifyRequest extends FastifyRequest {
  headers: {
    [HEADER_AUTHORIZATION]?: string
    [HEADER_REQUEST_ID]?: string
    [HEADER_LANGUAGE]?: string
    [key: string]: string | undefined
  }
  [key: string | symbol]: any
}

export interface I_FastifyReply extends FastifyReply {
  code(statusCode: number): I_FastifyReply
  status(statusCode: number): I_FastifyReply
  redirect(statusCode: number, url: string): I_FastifyReply
  redirect(url: string): I_FastifyReply
  hijack(): I_FastifyReply
  type(contentType: string): I_FastifyReply
  serializer(fn: (payload: any) => string): I_FastifyReply
  header(key: string, value: any): I_FastifyReply
  headers(values: { [key: string]: any }): I_FastifyReply
  then: never
  [key: string | symbol]: any
}
