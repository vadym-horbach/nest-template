import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger'
import { version } from '../package.json'

export const setupSwagger = (app: INestApplication): void => {
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Escrypto')
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
    customSiteTitle: 'Escrypto API',
  }
  SwaggerModule.setup('docs', app, swaggerDocument, options)
}
