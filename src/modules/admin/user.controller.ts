import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { FindOptionsWhere, Like, Not } from 'typeorm'
import { I18n, I_18nContext } from 'nestjs-i18n'
import { firstValueFrom } from 'rxjs'
import type { UserEntity } from '../../models'
import { UserRepository } from '../../models'
import { ApiGlobalHeaders } from '../../common/decorators/requests'
import { PermittedRoles } from '../auth/auth.decorators'
import { UserRolesEnum } from '../../models/user'
import { CreateUserDto, ListUsersDto, UpdateUserDto, UserFiltersDto } from './dto'
import { IDDto, SerializeGroupsEnum } from '../../common/serializers/responses'
import { CryptoService } from '../../shared'
import { AdminDto } from '../auth/dto'
import { fileDirs, FileStorageService } from '../../core'

@ApiBearerAuth()
@ApiTags('Admin User')
@ApiGlobalHeaders()
@PermittedRoles([UserRolesEnum.ADMIN])
@SerializeOptions({ groups: [SerializeGroupsEnum.ADMIN] })
@Controller('admin/users')
export class UserController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Get()
  async listUsers(@Query() filters: UserFiltersDto): Promise<ListUsersDto> {
    const total = await this.userRepository.count()
    const role: FindOptionsWhere<UserEntity> = {
      role: filters.admin ? UserRolesEnum.ADMIN : Not(UserRolesEnum.ADMIN),
    }

    const [data, count] = await this.userRepository.findAndCount({
      where: filters.search
        ? [
            { ...role, email: Like(`%${filters.search}%`) },
            { ...role, businessName: Like(`%${filters.search}%`) },
            { ...role, firstName: Like(`%${filters.search}%`) },
            { ...role, lastName: Like(`%${filters.search}%`) },
          ]
        : role,
      order: { [filters.orderBy]: filters.order },
      skip: (filters.page - 1) * filters.size,
      take: filters.size,
    })

    return { total, count, data }
  }

  @Post()
  async createUser(@I18n() i18n: I_18nContext, @Body() dto: CreateUserDto): Promise<UserEntity> {
    const entity = await this.userRepository.findByEmail(dto.email)

    if (entity) {
      throw new ConflictException(i18n.t('errors.conflict.alreadyExistsUser'))
    }

    return this.userRepository
      .create({
        ...dto,
        password: CryptoService.hashPassword(dto.password),
        logToken: CryptoService.uuid(),
      })
      .save()
  }

  @Get(':id')
  async fetchUser(
    @Param() { id }: IDDto,
    @Query() query: AdminDto,
    @I18n() i18n: I_18nContext,
  ): Promise<UserEntity> {
    const entity = await this.userRepository.findOne({
      where: { id, role: query.admin ? UserRolesEnum.ADMIN : Not(UserRolesEnum.ADMIN) },
    })

    if (!entity) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundUserId'))
    }

    return entity
  }

  @Patch(':id')
  async updateUser(
    @Param() { id }: IDDto,
    @I18n() i18n: I_18nContext,
    @Body() dto: UpdateUserDto,
  ): Promise<UserEntity> {
    const entity = await this.userRepository.findById(id)

    if (!entity) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundUserId'))
    }

    if (dto.email) {
      const emailEntity = await this.userRepository.findByEmail(dto.email)

      if (emailEntity && emailEntity.id !== entity.id) {
        throw new ConflictException(i18n.t('errors.conflict.alreadyExistsUser'))
      }
    }

    return this.userRepository
      .merge(entity, {
        ...dto,
        password: dto.password ? CryptoService.hashPassword(dto.password) : undefined,
      })
      .save()
  }

  @Delete(':id')
  async removeUser(@Param() { id }: IDDto, @I18n() i18n: I_18nContext): Promise<UserEntity> {
    const entity = await this.userRepository.findById(id)

    if (!entity) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundUserId'))
    }

    await firstValueFrom(
      this.fileStorageService.remove({ Key: `${fileDirs.PROFILE}/${entity.id}` }, true),
    )

    return entity.remove()
  }
}
