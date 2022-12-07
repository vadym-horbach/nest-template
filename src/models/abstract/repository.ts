import type {
  Repository,
  FindManyOptions,
  QueryRunner,
  SelectQueryBuilder,
  DeepPartial,
  SaveOptions,
  RemoveOptions,
  FindOptionsWhere,
  InsertResult,
  ObjectID,
  UpdateResult,
  DeleteResult,
  FindOneOptions,
} from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { UpsertOptions } from 'typeorm/repository/UpsertOptions'
import { Between, LessThan, MoreThan } from 'typeorm'
import { endOfDay, startOfDay } from 'date-fns'
import { BasicEntity } from './entity'
import { T_Nullable } from '../../common/interfaces'

abstract class RepositoryAdapter<Entity extends BasicEntity> {
  protected abstract readonly repository: Repository<Entity>

  createQueryBuilder(alias?: string, queryRunner?: QueryRunner): SelectQueryBuilder<Entity> {
    return this.repository.createQueryBuilder(alias, queryRunner)
  }

  hasId(entity: Entity): boolean {
    return this.repository.hasId(entity)
  }

  getId(entity: Entity): any {
    return this.repository.getId(entity)
  }

  create(): Entity
  create(entityLike: DeepPartial<Entity>): Entity
  create(entityLikeArray: DeepPartial<Entity>[]): Entity[]
  create(entityLike?: any): Entity | Entity[] {
    return this.repository.create(entityLike)
  }

  merge(mergeIntoEntity: Entity, ...entityLikes: DeepPartial<Entity>[]): Entity {
    return this.repository.merge(mergeIntoEntity, ...entityLikes)
  }

  async preload(entityLike: DeepPartial<Entity>): Promise<Entity | undefined> {
    return this.repository.preload(entityLike)
  }

  save<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & { reload: false },
  ): Promise<T[]>
  save<T extends DeepPartial<Entity>>(entities: T[], options?: SaveOptions): Promise<(T & Entity)[]>
  save<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & { reload: false },
  ): Promise<T>
  save<T extends DeepPartial<Entity>>(entity: T, options?: SaveOptions): Promise<T & Entity>
  async save(entity: any, options?: any): Promise<any> {
    return this.repository.save(entity, options)
  }

  remove(entities: Entity[], options?: RemoveOptions): Promise<Entity[]>
  remove(entity: Entity, options?: RemoveOptions): Promise<Entity>
  async remove(entity: any, options?: any): Promise<any> {
    return this.repository.remove(entity, options)
  }

  softRemove<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & {
      reload: false
    },
  ): Promise<T[]>
  softRemove<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions,
  ): Promise<(T & Entity)[]>
  softRemove<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & {
      reload: false
    },
  ): Promise<T>
  softRemove<T extends DeepPartial<Entity>>(entity: T, options?: SaveOptions): Promise<T & Entity>
  async softRemove(entity: any, options?: any): Promise<any> {
    return this.repository.softRemove(entity, options)
  }

  recover<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & {
      reload: false
    },
  ): Promise<T[]>
  recover<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions,
  ): Promise<(T & Entity)[]>
  recover<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & {
      reload: false
    },
  ): Promise<T>
  recover<T extends DeepPartial<Entity>>(entity: T, options?: SaveOptions): Promise<T & Entity>
  async recover(entity: any, options?: any): Promise<any> {
    return this.repository.recover(entity, options)
  }

  async insert(
    entity: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
  ): Promise<InsertResult> {
    return this.repository.insert(entity)
  }

  /** Run subscribers without entity value */
  async update(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<Entity>,
    partialEntity: QueryDeepPartialEntity<Entity>,
  ): Promise<UpdateResult> {
    return this.repository.update(criteria, partialEntity)
  }

  /** Run subscribers without entity value */
  async upsert(
    entityOrEntities: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
    conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
  ): Promise<InsertResult> {
    return this.repository.upsert(entityOrEntities, conflictPathsOrOptions)
  }

  async delete(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<Entity>,
  ): Promise<DeleteResult> {
    return this.repository.delete(criteria)
  }

  async softDelete(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<Entity>,
  ): Promise<UpdateResult> {
    return this.repository.softDelete(criteria)
  }

  async restore(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<Entity>,
  ): Promise<UpdateResult> {
    return this.repository.restore(criteria)
  }

  async count(options?: FindManyOptions<Entity>): Promise<number> {
    return this.repository.count(options)
  }

  async countBy(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<number> {
    return this.repository.countBy(where)
  }

  async find(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    return this.repository.find(options)
  }

  async findBy(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<Entity[]> {
    return this.repository.findBy(where)
  }

  async findAndCount(options?: FindManyOptions<Entity>): Promise<[Entity[], number]> {
    return this.repository.findAndCount(options)
  }

  async findAndCountBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<[Entity[], number]> {
    return this.repository.findAndCountBy(where)
  }

  async findOne(options: FindOneOptions<Entity>): Promise<Entity | null> {
    return this.repository.findOne(options)
  }

  async findOneBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<Entity | null> {
    return this.repository.findOneBy(where)
  }

  async findOneOrFail(options: FindOneOptions<Entity>): Promise<Entity> {
    return this.repository.findOneOrFail(options)
  }

  async findOneByOrFail(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<Entity> {
    return this.repository.findOneByOrFail(where)
  }

  async query(query: string, parameters?: any[]): Promise<any> {
    return this.repository.query(query, parameters)
  }

  async increment(
    conditions: FindOptionsWhere<Entity>,
    propertyPath: string,
    value: number | string,
  ): Promise<UpdateResult> {
    return this.repository.increment(conditions, propertyPath, value)
  }

  async decrement(
    conditions: FindOptionsWhere<Entity>,
    propertyPath: string,
    value: number | string,
  ): Promise<UpdateResult> {
    return this.repository.decrement(conditions, propertyPath, value)
  }
}

export abstract class BasicRepository<
  Entity extends BasicEntity,
> extends RepositoryAdapter<Entity> {
  async isTableExist() {
    const res = await this.repository.manager.query(
      `SELECT exists (SELECT FROM information_schema.tables WHERE table_name = '${this.repository.metadata.tableName}')`,
    )

    return !!res?.[0]?.exists
  }

  whereByDate(from: T_Nullable<Date>, to: T_Nullable<Date>) {
    if (from && to) {
      return { createdAt: Between(startOfDay(from), endOfDay(to)) }
    }

    if (from) {
      return { createdAt: MoreThan(startOfDay(from)) }
    }

    if (to) {
      return { createdAt: LessThan(endOfDay(to)) }
    }

    return null
  }

  async findById(id: Entity['id'], options: FindOneOptions<Entity> = {}) {
    return this.findOne({ ...options, where: { ...options.where, id } })
  }
}
