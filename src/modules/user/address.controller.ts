import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { I18n, I_18nContext } from 'nestjs-i18n'
import { CurrentUser } from '../auth/auth.decorators'
import { AddressEntity, AddressRepository, UserEntity } from '../../models'
import { ApiExceptions, ApiGlobalHeaders } from '../../common/decorators/requests'
import { IDDto } from '../../common/serializers/responses'
import { CreateAddressDto, UpdateAddressDto } from './dto'

@ApiBearerAuth()
@ApiTags('User Addresses')
@ApiGlobalHeaders()
@Controller('users/addresses')
export class AddressController {
  constructor(private readonly addressRepository: AddressRepository) {}

  @ApiExceptions({ Unauthorized: 'Token is not provided.;Token is not valid.' })
  @Get()
  async listAddresses(@CurrentUser() user: UserEntity): Promise<AddressEntity[]> {
    return this.addressRepository.find({ where: { userId: user.id } })
  }

  @ApiExceptions({
    Unauthorized: 'Token is not provided.;Token is not valid.',
    NotFound: 'Address not found.',
    BadRequest: 'Validation error.',
  })
  @Get(':id')
  async getAddress(
    @CurrentUser() user: UserEntity,
    @Param() { id }: IDDto,
    @I18n() i18n: I_18nContext,
  ): Promise<AddressEntity> {
    const entity = await this.addressRepository.findOne({ where: { userId: user.id, id } })

    if (!entity) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundAddress'))
    }

    return entity
  }

  @ApiExceptions({
    Unauthorized: 'Token is not provided.;Token is not valid.',
    BadRequest: 'Validation error.',
  })
  @Post()
  async createAddress(
    @CurrentUser() user: UserEntity,
    @Body() body: CreateAddressDto,
  ): Promise<AddressEntity> {
    const entity = this.addressRepository.create({ ...body, user })

    return entity.save()
  }

  @ApiExceptions({
    Unauthorized: 'Token is not provided.;Token is not valid.',
    NotFound: 'Address not found.',
    BadRequest: 'Validation error.',
  })
  @Patch(':id')
  async updateAddress(
    @CurrentUser() user: UserEntity,
    @Param() { id }: IDDto,
    @Body() body: UpdateAddressDto,
    @I18n() i18n: I_18nContext,
  ): Promise<AddressEntity> {
    const entity = await this.addressRepository.findById(id, { where: { userId: user.id } })

    if (!entity) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundAddress'))
    }

    return this.addressRepository.merge(entity, body).save()
  }

  @ApiExceptions({
    Unauthorized: 'Token is not provided.;Token is not valid.',
    NotFound: 'Address not found.',
    BadRequest: 'Validation error.',
  })
  @Delete(':id')
  async removeAddress(
    @CurrentUser() user: UserEntity,
    @Param() { id }: IDDto,
    @I18n() i18n: I_18nContext,
  ): Promise<AddressEntity> {
    const entity = await this.addressRepository.findById(id, { where: { userId: user.id } })

    if (!entity) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundAddress'))
    }

    return entity.remove()
  }
}
