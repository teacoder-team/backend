import type { INestApplication } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'

import { getSwaggerConfig } from '@/config'

export function setupSwagger(app: INestApplication) {
	const config = getSwaggerConfig()
	const document = SwaggerModule.createDocument(app, config)

	SwaggerModule.setup('/docs', app, document, {
		jsonDocumentUrl: 'openapi.json',
		yamlDocumentUrl: 'openapi.yaml'
	})
}
