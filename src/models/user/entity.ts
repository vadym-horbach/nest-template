import { Column, Entity } from 'typeorm'
import { Exclude, Expose } from 'class-transformer'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { EntityWithId } from '../abstract/entity'
import { SerializeGroupsEnum } from '../../common/serializers/responses'
import { UserRolesEnum, UserTypeEnum } from './constants'
import { SettingsEntity } from './embeded/settings.entity'

@Exclude()
@Entity('users')
export class UserEntity extends EntityWithId {
  @ApiHideProperty()
  @Column()
  logToken!: string

  @ApiProperty()
  @Expose()
  @Column({ type: 'enum', enum: UserTypeEnum, default: UserTypeEnum.PERSONAL })
  accountType: UserTypeEnum = UserTypeEnum.PERSONAL

  @ApiProperty({ example: 'en' })
  @Expose({ groups: [SerializeGroupsEnum.USER, SerializeGroupsEnum.ADMIN] })
  @Column({ default: 'en' })
  language: string = 'en'

  @ApiProperty()
  @Expose({ groups: [SerializeGroupsEnum.USER, SerializeGroupsEnum.ADMIN] })
  @Column({ nullable: true })
  lastActivities?: Date

  @ApiProperty()
  @Expose({ groups: [SerializeGroupsEnum.USER, SerializeGroupsEnum.ADMIN] })
  @Column({ type: 'enum', enum: UserRolesEnum, default: UserRolesEnum.USER })
  role: UserRolesEnum = UserRolesEnum.USER

  @ApiProperty({ example: 'John' })
  @Expose()
  @Column()
  firstName!: string

  @ApiProperty({ example: 'Doe' })
  @Expose()
  @Column()
  lastName!: string

  @ApiProperty({ example: 'example@mail.com' })
  @Expose()
  @Column({ unique: true })
  email!: string

  @ApiHideProperty()
  @Column()
  password!: string

  @ApiHideProperty()
  @Expose({ groups: [SerializeGroupsEnum.ADMIN] })
  @Column({ default: false })
  isVerifiedEmail: boolean = false

  @ApiProperty()
  @Expose({ groups: [SerializeGroupsEnum.USER, SerializeGroupsEnum.ADMIN] })
  @Column({ default: false })
  isVerifiedKYC: boolean = false

  @ApiProperty()
  @Expose({ groups: [SerializeGroupsEnum.USER, SerializeGroupsEnum.ADMIN] })
  @Column({ default: false })
  isBanned: boolean = false

  @ApiProperty({ example: '+15554445555' })
  @Expose({ groups: [SerializeGroupsEnum.USER, SerializeGroupsEnum.ADMIN] })
  @Column({ nullable: true })
  phone?: string

  @ApiProperty({ example: 'Acme Corporation' })
  @Expose({ groups: [SerializeGroupsEnum.USER, SerializeGroupsEnum.ADMIN] })
  @Column({ nullable: true })
  businessName?: string

  @ApiProperty({ example: '+15554445555' })
  @Expose({ groups: [SerializeGroupsEnum.USER, SerializeGroupsEnum.ADMIN] })
  @Column({ nullable: true })
  businessPhone?: string

  @ApiProperty({ example: '123 Main St Anytown, USA' })
  @Expose({ groups: [SerializeGroupsEnum.USER, SerializeGroupsEnum.ADMIN] })
  @Column({ nullable: true })
  businessAddress?: string

  @ApiProperty({ example: '123' })
  @Expose({ groups: [SerializeGroupsEnum.USER, SerializeGroupsEnum.ADMIN] })
  @Column({ nullable: true })
  fireblocksAccountId?: string

  @ApiProperty()
  @Expose()
  @Column({ nullable: true })
  imageUrl?: string

  @ApiProperty()
  @Expose()
  @Column(() => SettingsEntity)
  settings!: SettingsEntity
}
