export type T_DefaultContext = {
  from?: string
  to?: string
  clientRootUrl?: string
  apiRootUrl?: string
}

export type T_SendUrlContext = T_DefaultContext & {
  name: string
  url: string
}
export type T_SendCodeContext = T_DefaultContext & {
  name: string
  code: string
}
export type T_EscrowInvitationContext = T_DefaultContext & {
  receiverName: string
  name: string
  url: string
}

export type T_ContactUsContext = T_DefaultContext & {
  name: string
  company?: string
  phoneNumber: string
  email: string
  message: string
}

export type T_ChatNoticeContext = T_DefaultContext & {
  senderName: string
  escrowName: string
  text: string
  url: string
}
