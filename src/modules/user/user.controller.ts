import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UploadedFile,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { I18n, I_I18nContext } from 'nestjs-i18n'
import { CryptoService } from '../../shared'
import { CurrentUser } from '../auth/auth.decorators'
import { UserEntity, UserRepository } from '../../models'
import { ApiExceptions, ApiGlobalHeaders } from '../../common/decorators/requests'
import { SerializeGroupsEnum, StatusDto } from '../../common/serializers/responses'
import {
  ChangeEmailCodesDto,
  ChangeEmailDto,
  ConfirmChangeEmailCodesDto,
  EmailCodeTypesEnum,
} from './dto'
import { UserService } from './user.service'
import { UploadImgDto } from '../admin/dto/blog/upload-img.dto'
import { fileDirs, fileFilters, I_FileS3, UseAmazonS3File } from '../../providers/file-storage'
import { CURRENT_USER_KEY } from '../auth/guards/constants'
import { ChangeSettingsDto } from './dto/change-settings.dto'

@ApiBearerAuth()
@ApiTags('User')
@ApiGlobalHeaders()
@SerializeOptions({ groups: [SerializeGroupsEnum.USER] })
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
  ) {}

  @ApiExceptions({
    Unauthorized: 'Token is not provided.;Token is not valid.',
    Forbidden: 'You should verify your account first. We sent you a message on your email.',
  })
  @Get('me')
  async me(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return user
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImgDto })
  @UseAmazonS3File('image', {
    fileFilter: fileFilters.image,
    storageOptions: {
      dynamicPath: (req, file, callback) => {
        return callback(null, [fileDirs.PROFILE, req[CURRENT_USER_KEY].id])
      },
      replace: true,
    },
  })
  @Post('image')
  async uploadImage(
    @CurrentUser() ipmUser: UserEntity,
    @UploadedFile() file: I_FileS3,
    @I18n() i18n: I_I18nContext,
  ): Promise<UserEntity> {
    if (!file) {
      throw new BadRequestException(i18n.t('errors.badRequest.requiredFile'))
    }

    ipmUser.imageUrl = file.key

    return ipmUser.save()
  }

  @ApiExceptions({
    Unauthorized: 'Token is not provided.;Token is not valid.',
    BadRequest:
      'Validation error.;User with that email already exists.;Unable to resend.;Unable to resend, email address does not match.',
    Conflict: 'Mail to new email already sent. Please try again in 5 minutes.',
  })
  @Get('change-email-codes')
  async sendChangeEmailCodes(
    @CurrentUser() user: UserEntity,
    @Query() { type, email }: ChangeEmailCodesDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<StatusDto> {
    const existedUser = await this.userRepository.findByEmail(email)

    if (existedUser) {
      throw new ConflictException(i18n.t('errors.conflict.alreadyExistsUser'))
    }

    let codes = await this.userService.getChangeEmailCodes(user.id)

    if (!codes) {
      if (!type) {
        codes = { currentCode: '', email: '', newCode: '' }
      } else {
        throw new BadRequestException(i18n.t('errors.badRequest.unableResend'))
      }
    }

    if (type && codes.email !== email) {
      throw new BadRequestException(i18n.t('errors.badRequest.unableResendNotMatch'))
    }

    if (!type || type === EmailCodeTypesEnum.NEW) {
      const newCode = CryptoService.randomString(6)
      const isSent = await this.userService.sendChangeEmail({ ...user, email }, newCode)

      if (!isSent) {
        throw new ConflictException(i18n.t('errors.conflict.alreadySentNew'))
      }

      codes.email = email
      codes.newCode = CryptoService.hashPassword(newCode)

      await this.userService.saveChangeEmailCodes(user.id, codes)
    }

    if (!type || type === EmailCodeTypesEnum.CURRENT) {
      const currentCode = CryptoService.randomString(6)
      const isSent = await this.userService.sendChangeEmail(
        user,
        currentCode,
        type === EmailCodeTypesEnum.CURRENT,
      )

      if (!isSent) {
        throw new ConflictException(i18n.t('errors.conflict.alreadySentCurrent'))
      }

      codes.currentCode = CryptoService.hashPassword(currentCode)

      await this.userService.saveChangeEmailCodes(user.id, codes)
    }

    return { status: 'ok' }
  }

  @ApiExceptions({
    Unauthorized: 'Token is not provided.;Token is not valid.',
    BadRequest: 'Validation error.;User with that email already exists.',
  })
  @Post('change-email-codes')
  async confirmChangeEmailCodes(
    @CurrentUser() user: UserEntity,
    @Query() { type, code }: ConfirmChangeEmailCodesDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<StatusDto> {
    const codes = await this.userService.getChangeEmailCodes(user.id)

    if (
      !codes ||
      !CryptoService.comparePassword(
        type === EmailCodeTypesEnum.CURRENT ? codes.currentCode : codes.newCode,
        code,
      )
    ) {
      throw new BadRequestException(i18n.t('errors.badRequest.codeNotValid'))
    }

    return { status: 'ok' }
  }

  @ApiExceptions({
    Unauthorized: 'Token is not provided.;Token is not valid.',
    BadRequest: 'Validation error.;User with that email already exists.;Codes are invalid.',
  })
  @Post('change-email')
  async changeEmail(
    @CurrentUser() ipmUser: UserEntity,
    @Body() { currentCode, newCode }: ChangeEmailDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<UserEntity> {
    const codes = await this.userService.getChangeEmailCodes(ipmUser.id)

    if (
      !codes ||
      !CryptoService.comparePassword(codes.currentCode, currentCode) ||
      !CryptoService.comparePassword(codes.newCode, newCode)
    ) {
      throw new BadRequestException(i18n.t('errors.badRequest.codeNotValid'))
    }

    const existedUser = await this.userRepository.findByEmail(codes.email)

    if (existedUser) {
      throw new ConflictException(i18n.t('errors.conflict.alreadyExistsUser'))
    }

    ipmUser.email = codes.email
    await ipmUser.save()

    await this.userService.deleteChangeEmailCodes(ipmUser.id)

    return ipmUser
  }

  @Patch('settings')
  async updateSettings(
    @CurrentUser() user: UserEntity,
    @Body() dto: ChangeSettingsDto,
  ): Promise<UserEntity> {
    return this.userRepository.merge(user, { settings: dto }).save()
  }
}
