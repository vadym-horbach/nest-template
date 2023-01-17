import { CryptoService } from './crypto/crypto.service'
import { HelpersService } from './helpers/helpers.service'
import { GoogleAuthService } from './google/google-auth.service'
import { AppleAuthService } from './apple/apple-auth.service'
import { PubSubManager } from './pub-sub/pubSub.manager'

export const providers = [
  CryptoService,
  HelpersService,
  PubSubManager,
  GoogleAuthService,
  AppleAuthService,
]

export { CryptoService, HelpersService, PubSubManager, GoogleAuthService, AppleAuthService }
