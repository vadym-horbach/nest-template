import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { ParticipantEntity } from './entity'
import { BasicRepository } from '../../abstract/repository'

@Injectable()
export class ParticipantRepository extends BasicRepository<ParticipantEntity> {
  constructor(
    @InjectRepository(ParticipantEntity)
    protected readonly repository: Repository<ParticipantEntity>,
  ) {
    super()
  }
}
