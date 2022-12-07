import { IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { LoginDto } from './login.dto'
import { UserTypeEnum } from '../../../models/user'
import { IsValidCharacters, ValidateIfNullable } from '../../../common/decorators/validation'

export class RegisterDto extends LoginDto {
  @ApiProperty({ required: false })
  @IsIn([UserTypeEnum.PERSONAL, UserTypeEnum.BUSINESS])
  @IsOptional()
  accountType: UserTypeEnum = UserTypeEnum.PERSONAL

  @ApiProperty({ example: 'John' })
  @IsValidCharacters()
  @IsNotEmpty()
  firstName!: string

  @ApiProperty({ example: 'Doe' })
  @IsValidCharacters()
  @IsNotEmpty()
  lastName!: string

  @ApiPropertyOptional({ default: null })
  @ValidateIfNullable((object) => object.accountType === UserTypeEnum.BUSINESS)
  @IsString()
  @Length(1, 63)
  @IsNotEmpty()
  businessName?: string
}
