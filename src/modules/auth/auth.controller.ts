import { ApiTags } from '@nestjs/swagger'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  SerializeOptions,
  UnauthorizedException,
} from '@nestjs/common'
import { map, Observable, switchMap, throwError } from 'rxjs'
import { I18n, I_I18nContext } from 'nestjs-i18n'
import { Throttle } from '@nestjs/throttler'
import { UserEntity, UserRepository } from '../../models'
import {
  AppleOauthDto,
  AuthorizedResDto,
  AuthUrlResDto,
  CodeAccessDto,
  EmailRedirectDto,
  ForgotPasswordDto,
  GoogleOauthDto,
  LoginDto,
  OauthUrlDto,
  RefreshTokenDto,
  RegisterDto,
  ResendVerifyEmailDto,
  ResetPasswordDto,
  AdminDto,
} from './dto'
import { AuthDisable } from './auth.decorators'
import { AppleAuthService, CryptoService, GoogleAuthService } from '../../shared'
import { AuthService, SingleUseJwtEnum } from './auth.service'
import { T_TokenPayload } from '../../shared/apple/types'
import { SerializeGroupsEnum, StatusDto } from '../../common/serializers/responses'
import { ApiExceptions, ApiGlobalHeaders } from '../../common/decorators/requests'

@ApiTags('Authorization')
@ApiGlobalHeaders()
@AuthDisable()
@Throttle(2, 60)
@SerializeOptions({ groups: [SerializeGroupsEnum.USER] })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly appleAuthService: AppleAuthService,
  ) {}

  @ApiExceptions({
    BadRequest: 'Validation error;User with that email already exists',
  })
  @Throttle(2, 300)
  @Post('register')
  async register(
    @Query() { emailRedirect }: EmailRedirectDto,
    @Body() dto: RegisterDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<UserEntity> {
    const existedUser = await this.userRepository.findByEmail(dto.email)

    if (existedUser) {
      throw new ConflictException(i18n.t('errors.conflict.alreadyExistsUser'))
    }

    const user = this.userRepository.create({
      ...dto,
      language: i18n.lang,
      password: CryptoService.hashPassword(dto.password),
      logToken: CryptoService.uuid(),
    })

    await user.save()
    void this.authService.sendVerifyEmail(user, emailRedirect)

    return user
  }

  @ApiExceptions({
    BadRequest: 'Validation error.;Wrong credentials provided',
    Forbidden: 'You should verify your account first. We sent you a message on your email.',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Query() query: AdminDto, @Body() dto: LoginDto): Promise<AuthorizedResDto> {
    return this.authService.loginUser(dto)
  }

  @ApiExceptions({
    BadRequest: 'Validation error.;Refresh token is not valid. Please re-login.',
    Unauthorized: 'Refresh token is expired. Please re-login.',
  })
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() { refreshToken }: RefreshTokenDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<AuthorizedResDto> {
    const decoded = await this.authService.verifyRefreshJwt(refreshToken)

    if (!decoded) {
      throw new UnauthorizedException(i18n.t('errors.unauthorized.refreshTokenNotValid'))
    }

    const user = await this.userRepository.findById(decoded.userId)

    if (!user || user.logToken !== decoded.logToken) {
      throw new UnauthorizedException(i18n.t('errors.unauthorized.refreshTokenExpired'))
    }

    if (user.isBanned) {
      throw new ForbiddenException(i18n.t('errors.forbidden.banned'))
    }

    user.logToken = CryptoService.uuid()
    await user.save()

    const tokens = await this.authService.generateTokens(user.id, user.logToken)

    return { user, ...tokens }
  }

  @ApiExceptions({
    BadRequest: 'Validation error.',
    InternalServerError: "Google discover documentation doesn't response. Try again later.",
  })
  @Throttle(3, 10)
  @Get('google-oauth-url')
  oauthUrl(@Query() { redirectUrl, loginHint }: OauthUrlDto): Observable<AuthUrlResDto> {
    return this.googleAuthService
      .getAuthenticationUrl(loginHint, redirectUrl)
      .pipe(map((value) => ({ url: value })))
  }

  @ApiExceptions({
    BadRequest: 'Validation error.;Error submitting Google access_code',
    InternalServerError: "Google discover documentation doesn't response. Try again later.",
  })
  @Get('google-oauth')
  oauth(@Query() query: GoogleOauthDto): Observable<AuthorizedResDto> {
    return this.googleAuthService.getToken(query.code, true, false, query.redirectUrl).pipe(
      switchMap(async (tokensData) => {
        return this.authService.oauthUser(
          tokensData.email,
          tokensData.given_name,
          tokensData.family_name,
        )
      }),
    )
  }

  @ApiExceptions({
    BadRequest: 'Validation error.;Error submitting Apple Account access_code',
    InternalServerError: '',
  })
  @Post('apple-oauth')
  appleOauth(@Body() body: AppleOauthDto): Observable<AuthorizedResDto> {
    return this.appleAuthService.getToken(body.authorization.code).pipe(
      switchMap((tokensData) => {
        const payload = this.authService.decodeToken<T_TokenPayload>(tokensData.id_token)

        if (!payload) {
          return throwError(() => new InternalServerErrorException())
        }

        return this.authService.oauthUser(
          payload.email,
          body.user?.name.firstName,
          body.user?.name.lastName,
        )
      }),
    )
  }

  @ApiExceptions({
    BadRequest: 'Validation error.;Code is not valid.',
    Unauthorized: 'Code is expired.',
    Conflict: 'User already verified.',
  })
  @Get('verify-email')
  async verifyEmail(
    @Query() { code }: CodeAccessDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<StatusDto> {
    const decoded = await this.authService.verifySingleUseJwt(SingleUseJwtEnum.VERIFY_EMAIL, code)

    if (!decoded) throw new BadRequestException(i18n.t('errors.badRequest.codeNotValid'))
    const user = await this.userRepository.findById(decoded.userId)

    if (!user || user.logToken !== decoded.logToken) {
      throw new UnauthorizedException(i18n.t('errors.unauthorized.codeTokenExpired'))
    }

    if (user.isVerifiedEmail) {
      throw new ConflictException(i18n.t('errors.conflict.alreadyVerified'))
    }

    user.isVerifiedEmail = true
    user.logToken = CryptoService.uuid()
    await user.save()

    return { status: 'ok' }
  }

  @ApiExceptions({
    BadRequest: 'Validation error.;Code is not valid.',
    Unauthorized: 'Code is expired.',
    Conflict: 'Mail already sent. Please try again in 5 minutes.',
  })
  @Throttle(3, 60)
  @Post('verify-email')
  async resendVerifyEmail(
    @Query() { emailRedirect }: EmailRedirectDto,
    @Body() dto: ResendVerifyEmailDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<StatusDto> {
    let user
    let emailUrl = emailRedirect

    if (dto.code) {
      const decoded = await this.authService.verifySingleUseJwt(
        SingleUseJwtEnum.VERIFY_EMAIL,
        dto.code,
        { ignoreExpiration: true },
      )
      if (!decoded) throw new BadRequestException(i18n.t('errors.badRequest.codeNotValid'))
      user = await this.userRepository.findById(decoded.userId)

      if (!user || user.logToken !== decoded.logToken) {
        throw new UnauthorizedException(i18n.t('errors.unauthorized.codeTokenExpired'))
      }

      emailUrl = decoded.emailRedirect
    } else if (dto.email && dto.password) {
      user = await this.userRepository.findByEmailAndPassword(dto.email, dto.password)

      if (!user) {
        throw new BadRequestException(i18n.t('errors.badRequest.wrongCredentials'))
      }
    } else {
      throw new InternalServerErrorException()
    }

    if (user.isVerifiedEmail) {
      throw new ConflictException(i18n.t('errors.conflict.alreadyVerified'))
    }

    user.logToken = CryptoService.uuid()

    const isSent = await this.authService.sendVerifyEmail(user, emailUrl)
    if (!isSent) throw new ConflictException(i18n.t('errors.conflict.alreadySent'))
    await user.save()

    return { status: 'ok' }
  }

  @ApiExceptions({
    BadRequest: 'Validation error',
    NotFound: 'User with this email not found.',
    Conflict: 'Mail already sent. Please try again in 5 minutes.',
  })
  @Post('forgot-password')
  async forgotPassword(
    @Query() { emailRedirect }: EmailRedirectDto,
    @Body() { email }: ForgotPasswordDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<StatusDto> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundUser'))
    }

    const isSent = await this.authService.sendForgotEmail(user, emailRedirect)
    if (!isSent) throw new ConflictException(i18n.t('errors.conflict.alreadySent'))

    return { status: 'ok' }
  }

  @ApiExceptions({
    BadRequest:
      'Validation error.;User with this email not found.;New password should not be the same',
    Unauthorized: 'Code is expired.',
  })
  @Throttle(3, 60)
  @Post('reset-password')
  async resetPassword(
    @Body() { code, password }: ResetPasswordDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<StatusDto> {
    const decoded = await this.authService.verifySingleUseJwt(
      SingleUseJwtEnum.FORGOT_PASSWORD,
      code,
    )
    if (!decoded) throw new BadRequestException(i18n.t('errors.badRequest.codeNotValid'))

    const user = await this.userRepository.findById(decoded.userId)

    if (!user || !CryptoService.comparePassword(decoded.hash, user.password)) {
      throw new UnauthorizedException(i18n.t('errors.unauthorized.codeTokenExpired'))
    }

    if (CryptoService.comparePassword(user.password, password)) {
      throw new BadRequestException(i18n.t('errors.badRequest.notSamePassword'))
    }

    user.password = CryptoService.hashPassword(password)
    user.logToken = CryptoService.uuid()
    await user.save()
    void this.authService.sendPasswordChangedMail(user.email)

    return { status: 'ok' }
  }
}
