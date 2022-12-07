import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { UserEntity } from './entity'
import { BasicRepository } from '../abstract/repository'
import { CryptoService } from '../../shared'

@Injectable()
export class UserRepository extends BasicRepository<UserEntity> {
  constructor(@InjectRepository(UserEntity) protected readonly repository: Repository<UserEntity>) {
    super()
  }

  async findByEmail(email: string) {
    return this.findOne({ where: { email } })
  }

  async findByEmailAndPassword(email: string, password: string) {
    const user = await this.findByEmail(email)

    if (user && CryptoService.comparePassword(user.password, password)) {
      return user
    }

    return null
  }
}
