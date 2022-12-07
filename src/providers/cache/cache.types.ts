import { Cache, Store } from 'cache-manager'
import IORedis, { Cluster } from 'ioredis'
import { ClusterOptions } from 'ioredis/built/cluster/ClusterOptions'
import { ClusterNode } from 'ioredis/built/cluster'
import { RedisOptions } from 'ioredis/built/redis/RedisOptions'

export type T_RedisStoreConstructor =
  | [number, string, RedisOptions]
  | [string, RedisOptions]
  | [number, RedisOptions]
  | [number, string]
  | [RedisOptions]
  | [number]
  | [string]
  | [
      {
        redisInstance?: IORedis
        ttl?: number
        clusterConfig?: {
          startupNodes: ClusterNode[]
          options?: ClusterOptions
        }
      },
    ]

export interface I_RedisStore extends Store {
  getClient(): IORedis | Cluster
  name: 'redis'
  isCacheableValue(value: any): boolean
}

interface I_RedisSingleNodeStore extends I_RedisStore {
  getClient(): IORedis
}
export interface I_SingleNodeCache extends Cache {
  store: I_RedisSingleNodeStore
}
