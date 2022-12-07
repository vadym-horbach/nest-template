import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BasicRepository } from '../abstract/repository'
import { AddressEntity } from './entity'

@Injectable()
export class AddressRepository extends BasicRepository<AddressEntity> {
  constructor(
    @InjectRepository(AddressEntity) protected readonly repository: Repository<AddressEntity>,
  ) {
    super()
  }
}
