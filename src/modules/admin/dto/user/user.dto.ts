import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'
import { UserRolesEnum, UserTypeEnum } from '../../../../models/user'
import {
  IsPassword,
  IsValidCharacters,
  ValidateIfNullable,
} from '../../../../common/decorators/validation'

export class CreateUserDto {
  @ApiProperty({ example: 'example@mail.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({ example: '#Pass$123' })
  @IsPassword()
  @IsNotEmpty()
  password!: string

  @ApiProperty({ required: false })
  @IsEnum(UserTypeEnum)
  @IsOptional()
  accountType: UserTypeEnum = UserTypeEnum.PERSONAL

  @ApiProperty({ example: 'en' })
  @IsIn(['en', 'ar', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'zh'])
  @IsOptional()
  language?: string

  @ApiProperty({ required: false })
  @IsEnum(UserRolesEnum)
  @IsOptional()
  role?: UserRolesEnum = UserRolesEnum.USER

  @ApiProperty({ example: 'John' })
  @IsValidCharacters()
  @IsNotEmpty()
  firstName!: string

  @ApiProperty({ example: 'Doe' })
  @IsValidCharacters()
  @IsNotEmpty()
  lastName!: string

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isVerifiedEmail?: boolean = false

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isVerifiedKYC?: boolean = false

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isBanned?: boolean = false

  @ApiPropertyOptional({ default: null })
  @ValidateIfNullable((object) => object.accountType === UserTypeEnum.BUSINESS)
  @IsString()
  @Length(1, 63)
  @IsNotEmpty()
  businessName?: string

  @ApiPropertyOptional({ default: null })
  @ValidateIfNullable((object) => object.accountType === UserTypeEnum.BUSINESS)
  @IsString()
  @Length(1, 63)
  @IsNotEmpty()
  businessAddress?: string
}

export class UpdateUserDto {
  @ApiProperty({ example: 'example@mail.com' })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ example: '#Pass$123' })
  @IsPassword()
  @IsOptional()
  password?: string

  @ApiProperty()
  @IsEnum(UserTypeEnum)
  @IsOptional()
  accountType?: UserTypeEnum

  @ApiProperty({ example: 'en' })
  @IsIn(['en', 'ar', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'zh'])
  @IsOptional()
  language?: string

  @ApiProperty({ required: false })
  @IsEnum(UserRolesEnum)
  @IsOptional()
  role?: UserRolesEnum

  @ApiProperty({ example: 'John' })
  @IsValidCharacters()
  @IsOptional()
  firstName?: string

  @ApiProperty({ example: 'Doe' })
  @IsValidCharacters()
  @IsOptional()
  lastName?: string

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isVerifiedEmail?: boolean

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isVerifiedKYC?: boolean

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isBanned?: boolean

  @ApiPropertyOptional({ default: null })
  @ValidateIfNullable((object) => object.accountType === UserTypeEnum.BUSINESS)
  @IsString()
  @Length(1, 63)
  @IsOptional()
  businessName?: string

  @ApiPropertyOptional({ default: null })
  @ValidateIfNullable((object) => object.accountType === UserTypeEnum.BUSINESS)
  @IsString()
  @Length(1, 63)
  @IsOptional()
  businessAddress?: string
}
