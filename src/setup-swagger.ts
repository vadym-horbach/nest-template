import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger'
import { upperFirst } from 'lodash'
import { version, name } from '../package.json'

export const setupSwagger = (app: INestApplication): void => {
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(name)
      .setDescription('API DOC')
      .setVersion(version)
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .build(),
  )
  const options: SwaggerCustomOptions = {
    explorer: false,
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      deepLinking: true,
      displayOperationId: true,
      displayRequestDuration: true,
      validatorUrl: 'none',
    },
    customSiteTitle: `${upperFirst(name)} API`,
  }
  SwaggerModule.setup('docs', app, swaggerDocument, options)
}
