import type { INestApplication } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'

import { getSwaggerConfig } from '@/config'

export function setupSwagger(app: INestApplication) {
	const swaggerConfig = getSwaggerConfig()
	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

	SwaggerModule.setup('/docs', app, swaggerDocument, {
		jsonDocumentUrl: 'docs/json',
		yamlDocumentUrl: 'docs/yaml'
	})
}
