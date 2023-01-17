import { ApiTags } from '@nestjs/swagger'
import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import { Like } from 'typeorm'
import { I18n, I_18nContext } from 'nestjs-i18n'
import { ApiGlobalHeaders } from '../../common/decorators/requests'
import { AuthDisable } from '../auth/auth.decorators'
import { BlogPostEntity, BlogPostRepository } from '../../models'
import { BlogFiltersDto, ListBlogsDto } from './dto/list-blogs.dto'
import { UUIDDto } from '../../common/serializers/responses'

@ApiTags('Blogs')
@ApiGlobalHeaders()
@AuthDisable()
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogPostRepository: BlogPostRepository) {}

  @Get()
  async listUsers(@Query() filters: BlogFiltersDto): Promise<ListBlogsDto> {
    const total = await this.blogPostRepository.count()

    const [data, count] = await this.blogPostRepository.findAndCount({
      where: filters.search ? { title: Like(`%${filters.search}%`) } : undefined,
      order: { [filters.orderBy]: filters.order },
      skip: (filters.page - 1) * filters.size,
      take: filters.size,
    })

    return { total, count, data }
  }

  @Get(':id')
  async fetchBlog(@Param() { id }: UUIDDto, @I18n() i18n: I_18nContext): Promise<BlogPostEntity> {
    const entity = await this.blogPostRepository.findOne({ where: { id } })

    if (!entity) {
      throw new NotFoundException(i18n.t('errors.notFound.notFoundBlog'))
    }

    return entity
  }
}
