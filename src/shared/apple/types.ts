export type T_GetTokenResponse = {
  access_token: string
  expires_in: number
  id_token: string
  refresh_token: string
}
export type T_TokenPayload = {
  iss: string
  aud: string
  exp: number
  iat: number
  sub: string
  at_hash: string
  email: string
  email_verified: string
  is_private_email: string
  auth_time: number
  nonce_supported: boolean
}
