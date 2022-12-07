import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt'
import { ImATeapotException } from '@nestjs/common/exceptions/im-a-teapot.exception'
import { AppConfigService, AppLoggerService, MailService } from '../../core'
import type { T_JwtPayload } from './auth.types'
import { T_SingleUsePayload } from './auth.types'
import { UserEntity, UserRepository } from '../../models'
import { CryptoService } from '../../shared'
import { AsyncStorageService } from '../../providers/async-storage'
import { UserRolesEnum } from '../../models/user'
import { LoginDto } from './dto'

export enum SingleUseJwtEnum {
  VERIFY_EMAIL = 'verify_email',
  FORGOT_PASSWORD = 'forgot_password',
}
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly asyncStorageService: AsyncStorageService,
    private readonly configService: AppConfigService,
    private readonly loggerService: AppLoggerService,
    private readonly mailService: MailService,
  ) {
    this.loggerService.setContext(AuthService.name)
  }

  private async verifyJwt<T extends Record<string, any>>(
    token: string,
    options?: JwtVerifyOptions,
  ) {
    try {
      return await this.jwtService.verifyAsync<T>(token, options)
    } catch (e: any) {
      this.loggerService.error(e)

      return null
    }
  }

  decodeToken<T>(token: string): T | null {
    return <T>this.jwtService.decode(token)
  }

  private async generateAccessJwt(payload: T_JwtPayload) {
    return this.jwtService.signAsync(payload)
  }

  async verifyAccessJwt(token: string) {
    return this.verifyJwt<T_JwtPayload>(token)
  }

  private async generateRefreshJwt(payload: T_JwtPayload) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.refreshJwt.secret,
      expiresIn: this.configService.refreshJwt.expiresIn,
    })
  }

  async verifyRefreshJwt(token: string) {
    return this.verifyJwt<T_JwtPayload>(token, { secret: this.configService.refreshJwt.secret })
  }

  async generateTokens(userId: number, logToken: string) {
    const payload = { userId, logToken }
    const accessToken = await this.generateAccessJwt(payload)
    const refreshToken = await this.generateRefreshJwt(payload)

    return { accessToken, refreshToken }
  }

  async oauthUser(email: string, firstName?: string, lastName?: string) {
    const i18n = this.asyncStorageService.getI18n()
    let user = await this.userRepository.findByEmail(email)

    if (!user) {
      user = this.userRepository.create({
        email,
        isVerifiedEmail: true,
        firstName: firstName ?? 'Unknown',
        lastName: lastName ?? CryptoService.randomString(4),
        logToken: CryptoService.uuid(),
        password: CryptoService.hashPassword(CryptoService.randomString()),
      })
    } else {
      if (user.isBanned) {
        throw new ForbiddenException(i18n.t('errors.forbidden.banned'))
      }

      user = this.userRepository.merge(user, {
        logToken: CryptoService.uuid(),
        firstName,
        lastName,
      })

      if (!user.isVerifiedEmail) {
        user.isVerifiedEmail = true
      }
    }

    await user.save()
    const tokens = await this.generateTokens(user.id, user.logToken)

    return { user, ...tokens }
  }

  private singleUseJwtConfig(type: SingleUseJwtEnum) {
    switch (type) {
      case SingleUseJwtEnum.VERIFY_EMAIL:
        return {
          secret: `${this.configService.defaultJwt.secret}_${SingleUseJwtEnum.VERIFY_EMAIL}`,
          expiresIn: '3 hours',
        }
      case SingleUseJwtEnum.FORGOT_PASSWORD:
        return {
          secret: `${this.configService.defaultJwt.secret}_${SingleUseJwtEnum.FORGOT_PASSWORD}`,
          expiresIn: '1 hours',
        }
      default:
        throw new InternalServerErrorException('Invalid token type')
    }
  }

  async generateSingleUseJwt<T extends SingleUseJwtEnum>(type: T, payload: T_SingleUsePayload<T>) {
    return this.jwtService.signAsync(payload, this.singleUseJwtConfig(type))
  }

  async verifySingleUseJwt<T extends SingleUseJwtEnum>(
    type: T,
    token: string,
    options?: JwtVerifyOptions,
  ) {
    return this.verifyJwt<T_SingleUsePayload<T>>(token, {
      ...this.singleUseJwtConfig(type),
      ...options,
    })
  }

  async sendVerifyEmail(user: UserEntity, redirectUrl?: string) {
    const url = redirectUrl || `${this.configService.clientRootUrl}/verify-email`
    const code = await this.generateSingleUseJwt(SingleUseJwtEnum.VERIFY_EMAIL, {
      userId: user.id,
      logToken: user.logToken,
      emailRedirect: url,
    })

    return this.mailService.sendVerifyThrottled(user.email, {
      name: `${user.firstName} ${user.lastName}`,
      url: `${url}?code=${code}`,
    })
  }

  async sendForgotEmail(user: UserEntity, redirectUrl?: string) {
    const url = redirectUrl || `${this.configService.clientRootUrl}/forgot-password`
    const code = await this.generateSingleUseJwt(SingleUseJwtEnum.FORGOT_PASSWORD, {
      userId: user.id,
      hash: CryptoService.hashPassword(user.password),
    })

    return this.mailService.sendForgotThrottled(user.email, {
      name: `${user.firstName} ${user.lastName}`,
      url: `${url}?code=${code}`,
    })
  }

  async sendPasswordChangedMail(to: string) {
    this.loggerService.log(to)
    // return this.mailService.sendPasswordChangedMail(to)
  }

  async findUserByToken(jwtToken: string): Promise<UserEntity> {
    const i18n = this.asyncStorageService.getI18n()
    const decoded = await this.verifyAccessJwt(jwtToken)

    if (!decoded) throw new UnauthorizedException(i18n.t('errors.unauthorized.tokenNotValid'))

    // TODO Cache user
    const user = await this.userRepository.findById(decoded.userId)

    if (!user || user.logToken !== decoded.logToken) {
      throw new UnauthorizedException(i18n.t('errors.unauthorized.tokenNotValid'))
    }

    return user
  }

  async loginUser(dto: LoginDto, isAdmin = false) {
    const i18n = this.asyncStorageService.getI18n()

    const user = await this.userRepository.findByEmailAndPassword(dto.email, dto.password)

    if (!user) {
      throw new BadRequestException(i18n.t('errors.badRequest.wrongCredentials'))
    }

    if (user.isBanned) {
      throw new ForbiddenException(i18n.t('errors.forbidden.banned'))
    }

    if (!user.isVerifiedEmail) {
      throw new ImATeapotException(i18n.t('errors.imATeapot.shouldVerify'))
    }

    if (isAdmin && user.role !== UserRolesEnum.ADMIN) {
      throw new ForbiddenException(i18n.t('errors.forbidden.permissions'))
    }

    user.logToken = CryptoService.uuid()
    await user.save()

    const tokens = await this.generateTokens(user.id, user.logToken)

    return { user, ...tokens }
  }
}
