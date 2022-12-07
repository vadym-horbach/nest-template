import { Transform } from 'class-transformer'
import { Column, ColumnOptions } from 'typeorm'

export const TransformBooleanLike = (values: any[] = [true, 'enabled', 'true', '1', 'on']) => {
  return Transform(({ obj, key }) => {
    return values.includes(obj[key])
  })
}

export const ColumnUUID = (options: ColumnOptions = {}) => {
  return Column({
    transformer: {
      from: (text) => (text ? text.replaceAll(/-/g, '') : text),
      to: (value) => value,
    },
    ...options,
  })
}
