import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { AddressController } from './address.controller'

@Module({
  imports: [],
  providers: [UserService],
  controllers: [UserController, AddressController],
})
export class UserModule {}
