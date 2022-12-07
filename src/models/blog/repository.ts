import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BasicRepository } from '../abstract/repository'
import { BlogPostEntity } from './entity'

@Injectable()
export class BlogPostRepository extends BasicRepository<BlogPostEntity> {
  constructor(
    @InjectRepository(BlogPostEntity) protected readonly repository: Repository<BlogPostEntity>,
  ) {
    super()
  }
}
