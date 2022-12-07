import { CryptoService } from './crypto/crypto.service'
import { HelpersService } from './helpers/helpers.service'
import { GoogleAuthService } from './google/google-auth.service'
import { AppleAuthService } from './apple/apple-auth.service'

export const providers = [CryptoService, HelpersService, GoogleAuthService, AppleAuthService]

export { CryptoService, HelpersService, GoogleAuthService, AppleAuthService }
