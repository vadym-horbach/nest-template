import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Patch,
  Post,
  SerializeOptions,
  UploadedFile,
} from '@nestjs/common'
import { I18n, I_I18nContext } from 'nestjs-i18n'
import { firstValueFrom } from 'rxjs'
import { ApiGlobalHeaders } from '../../common/decorators/requests'
import { CurrentUser, PermittedRoles } from '../auth/auth.decorators'
import {
  fileDirs,
  fileFilters,
  FileStorageService,
  I_FileS3,
  UseAmazonS3File,
} from '../../providers/file-storage'
import { BlogPostEntity, BlogPostRepository, UserEntity } from '../../models'
import { CreatePostDto } from './dto/blog/create-post.dto'
import { UploadImgDto } from './dto/blog/upload-img.dto'
import { SerializeGroupsEnum, UUIDDto } from '../../common/serializers/responses'
import { UserRolesEnum } from '../../models/user'
import { UpdatePostDto } from './dto/blog/update-post.dto'

@ApiBearerAuth()
@ApiTags('Admin Blogs')
@ApiGlobalHeaders()
@PermittedRoles([UserRolesEnum.ADMIN])
@SerializeOptions({ groups: [SerializeGroupsEnum.ADMIN] })
@Controller('admin/blogs')
export class BlogController {
  constructor(
    private readonly blogPostRepository: BlogPostRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Post()
  async createPost(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreatePostDto,
  ): Promise<BlogPostEntity> {
    return this.blogPostRepository.create({ ...dto, user }).save()
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImgDto })
  @UseAmazonS3File('image', {
    fileFilter: fileFilters.image,
    storageOptions: { dynamicPath: [fileDirs.BLOG, 'id'], replace: true },
  })
  @Post(':id/image')
  async uploadImage(
    @CurrentUser() user: UserEntity,
    @Param() { id }: UUIDDto,
    @UploadedFile() file: I_FileS3,
    @I18n() i18n: I_I18nContext,
  ): Promise<BlogPostEntity> {
    if (!file) {
      throw new BadRequestException(i18n.t('errors.badRequest.requiredFile'))
    }

    const entity = await this.blogPostRepository.findOne({ where: { id } })

    if (!entity) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundBlog'))
    }

    entity.imageUrl = file.key

    return entity.save()
  }

  @Patch(':id')
  async updatePost(
    @CurrentUser() user: UserEntity,
    @Param() { id }: UUIDDto,
    @Body() dto: UpdatePostDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<BlogPostEntity> {
    const entity = await this.blogPostRepository.findOne({ where: { id } })

    if (!entity) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundBlog'))
    }

    return this.blogPostRepository.merge(entity, dto).save()
  }

  @Delete(':id')
  async removePost(
    @CurrentUser() user: UserEntity,
    @Param() { id }: UUIDDto,
    @I18n() i18n: I_I18nContext,
  ): Promise<BlogPostEntity> {
    const entity = await this.blogPostRepository.findOne({ where: { id } })

    if (!entity) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundBlog'))
    }

    await firstValueFrom(
      this.fileStorageService.remove({ Key: `${fileDirs.BLOG}/${entity.id}` }, true),
    )

    return entity.remove()
  }
}
