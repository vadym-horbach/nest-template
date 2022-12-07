export type T_GoogleOpenId = {
  issuer: string
  authorization_endpoint: string
  device_authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  revocation_endpoint: string
  jwks_uri: string
}
export type T_AccessTokenInfo = {
  azp: string
  aud: string
  sub: string
  scope: string
  exp: string
  expires_in: number
  email: string
  email_verified: string
  access_type: string
  [key: string]: any
}
type T_AccessTokenParams = {
  access_token: string
}
type T_IdTokenParams = {
  id_token: string
}
export type T_TokenParams = T_AccessTokenParams & T_IdTokenParams
export type T_TokenParamsVariants = T_AccessTokenParams | T_IdTokenParams | T_TokenParams
export type T_IdTokenInfo = {
  iss: string
  azp: string
  aud: string
  sub: string
  email: string
  email_verified: string
  at_hash: string
  iat: string
  exp: string
  alg: string
  kid: string
  typ: string
  hd: string
  name?: string
  picture?: string
  given_name?: string
  family_name?: string
  [key: string]: any
}

export type T_TokenInfo<T> = T extends T_TokenParams
  ? T_AccessTokenInfo & T_IdTokenInfo
  : T extends T_AccessTokenParams
  ? T_AccessTokenInfo
  : T extends T_IdTokenParams
  ? T_IdTokenInfo
  : never

export type T_GetTokenResponse = {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  id_token: string
  refresh_token?: string
}

export type T_GetTokenWithInfoResponse<T extends boolean> = T extends true
  ? T_TokenInfo<T_TokenParams> & T_GetTokenResponse
  : T_GetTokenResponse
