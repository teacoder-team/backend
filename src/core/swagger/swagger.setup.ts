import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { SwaggerDto } from './dto/swagger.dto'

// import * as fs from 'fs'
// import path from 'path'
// import { generateApi } from 'swagger-typescript-api'
// import * as YAML from 'yaml'

export async function setupSwagger(
	config: SwaggerDto,
	app: INestApplication,
	prefix?: string
): Promise<void> {
	if (!config.enabled) {
		return
	}

	const options = new DocumentBuilder()
		.setTitle(config.title)
		.setDescription(config.description)
		.setVersion(config.version)
		.addBearerAuth()

	if (config.contact) {
		options.setContact(
			config.contact.name,
			config.contact.site,
			config.contact.email
		)
	}

	for (const server of config?.servers || []) {
		options.addServer(server.url, server.description)
	}

	const document = SwaggerModule.createDocument(app, options.build())

	// let swaggerStringify = JSON.stringify(document)
	// swaggerStringify = swaggerStringify.replace(
	// 	/\"allOf\"\:\[\{(.*?)}\]/gim,
	// 	'$1'
	// )

	// const swaggerDirectory = path.resolve(
	// 	process.cwd(),
	// 	'./src/core/swagger/schema'
	// )
	// const swaggerJsonPath = path.join(swaggerDirectory, 'swagger.json')
	// const swaggerYamlPath = path.join(swaggerDirectory, 'swagger.yaml')

	// if (!fs.existsSync(swaggerDirectory)) {
	// 	fs.mkdirSync(swaggerDirectory, { recursive: true })
	// }

	// fs.writeFileSync(swaggerJsonPath, swaggerStringify)
	// fs.writeFileSync(swaggerYamlPath, YAML.stringify(document))

	// await generateApi({
	// 	name: 'api.client.ts',
	// 	output: swaggerDirectory,
	// 	input: swaggerYamlPath,
	// 	httpClientType: 'fetch'
	// })

	const swaggerPath = prefix
		? `/${prefix}/${config.path}`.replaceAll('//', '/')
		: config.path

	SwaggerModule.setup(swaggerPath || 'swagger', app, document, {
		swaggerOptions: {
			persistAuthorization: true
		}
	})
}
