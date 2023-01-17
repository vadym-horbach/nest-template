import { DataSource, DefaultNamingStrategy } from 'typeorm'
import path from 'path'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import _ from 'lodash'
import { AppConfigService } from '../core'
import { entities } from './index'

class CustomNamingStrategy extends DefaultNamingStrategy {
  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    const name = customName || propertyName

    if (embeddedPrefixes.length) {
      return `${_.camelCase(embeddedPrefixes.join('_'))}${_.upperFirst(_.camelCase(name))}`
    }

    return name
  }
}

export const getDbConfig = (config: PostgresConnectionOptions): PostgresConnectionOptions => {
  return {
    applicationName: 'nest_template',
    namingStrategy: new CustomNamingStrategy(),
    synchronize: false,
    entities,
    migrations: [path.join(__dirname, '../migrations/**/*')],
    ...config,
  }
}

export const source = new DataSource(getDbConfig(AppConfigService.getInstance().database))
