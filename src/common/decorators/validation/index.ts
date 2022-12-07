import { IsBoolean, IsString, Length, Matches, ValidateIf } from 'class-validator'
import { Transform } from 'class-transformer'
import { applyDecorators } from '@nestjs/common'
import { MESSAGE, REGEX } from '../../constants'
import { TransformBooleanLike } from '../transform'

export const ValidateIfNullable = (condition: (object: any, value: any) => boolean) => {
  return applyDecorators(
    Transform(({ obj, value }) => (condition(obj, value) ? value : undefined)),
    ValidateIf(condition),
  )
}

export const IsBooleanLike = (values: any[] = [true, 'enabled', 'true', '1', 'on']) => {
  return applyDecorators(TransformBooleanLike(values), IsBoolean())
}

export const IsValidCharacters = () => {
  return applyDecorators(
    IsString(),
    Length(1, 63),
    Matches(REGEX.characters, '', { message: MESSAGE.characters }),
  )
}

export const IsPassword = () => {
  return applyDecorators(
    IsString(),
    Length(8, 63),
    Matches(REGEX.password, '', { message: MESSAGE.password }),
  )
}
