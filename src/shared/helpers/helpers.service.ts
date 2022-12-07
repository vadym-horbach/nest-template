import { Injectable } from '@nestjs/common'
import _ from 'lodash'

@Injectable()
export class HelpersService {
  static urlFromString(url?: string | null): URL | null {
    try {
      if (!url) return null

      return new URL(url)
    } catch {
      return null
    }
  }

  static deepEqual<T>(a: T, b: T): boolean {
    if (_.isArray(a) && _.isArray(b)) {
      return _.isEmpty(_.xorWith(a, b, _.isEqual))
    }

    if (_.isObjectLike(a) && _.isObjectLike(b)) {
      return _.isEqual(a, b)
    }

    return a === b
  }

  static toNumber(value: unknown, defaultValue: number = 0): number {
    return _.defaultTo(_.toNumber(value), defaultValue)
  }
}
