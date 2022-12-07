import IORedis, { Cluster } from 'ioredis'
import _ from 'lodash'
import type { Ttl } from 'cache-manager'
import { I_RedisStore, T_RedisStoreConstructor } from './cache.types'

class RedisStore implements I_RedisStore {
  private readonly redis: IORedis | Cluster

  private readonly defaultTTL?: number

  readonly name = 'redis'

  constructor(...args: T_RedisStoreConstructor) {
    const options = args[0]
    const isObjectOptions = options && _.isObject(options)

    if (isObjectOptions && 'redisInstance' in options && options?.redisInstance) {
      this.redis = options.redisInstance
    } else if (isObjectOptions && 'clusterConfig' in options && options?.clusterConfig) {
      this.redis = new Cluster(options.clusterConfig.startupNodes, options.clusterConfig.options)
    } else {
      this.redis = new IORedis(...(args as unknown as []))
    }

    if (isObjectOptions && 'ttl' in options) {
      this.defaultTTL = options.ttl
    }
  }

  isCacheableValue(value: any): boolean {
    return value !== undefined && value !== null
  }

  getClient(): IORedis | Cluster {
    return this.redis
  }

  async set<T>(key: string, data: T, ttl?: Ttl): Promise<void> {
    const val = JSON.stringify(data) || '"undefined"'

    if (!this.isCacheableValue(data)) {
      throw new Error(`"${data}" is not a cacheable value`)
    }

    const exp = ttl || ttl === 0 ? ttl : this.defaultTTL

    if (exp) {
      await this.redis.setex(key, exp, val)
    } else {
      await this.redis.set(key, val)
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.redis.get(key)

    if (!value) {
      return undefined
    }

    return JSON.parse(value)
  }

  async del(...args: string[]): Promise<void> {
    await this.redis.del(args)
  }

  async keys(pattern?: string): Promise<string[]> {
    return this.redis.keys(pattern || '*')
  }

  async mdel(...args: string[]): Promise<void> {
    await this.del(...args)
  }

  async mget(...args: string[]): Promise<unknown[]> {
    return Promise.all(args.map(async (key) => this.get(key)))
  }

  async mset(args: [string, unknown][], ttl?: Ttl): Promise<void> {
    await Promise.all(args.map(async ([key, value]) => this.set(key, value, ttl)))
  }

  async reset(): Promise<void> {
    await this.redis.flushdb()
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key)
  }
}

export const redisStore = {
  create: (...args: T_RedisStoreConstructor) => new RedisStore(...args),
}
