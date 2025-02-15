import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import * as fs from 'fs'
import * as path from 'path'
import * as YAML from 'yaml'

export function setupSwagger(app: INestApplication): void {
	const swaggerConfig = createSwaggerConfig()
	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

	const formattedDocument = formatSwaggerDocument(swaggerDocument)
	saveSwaggerFiles(formattedDocument, swaggerDocument)

	SwaggerModule.setup('docs', app, swaggerDocument)
}

function createSwaggerConfig() {
	return new DocumentBuilder()
		.setTitle('TeaCoder API')
		.setDescription('API for Teacoder educational platform')
		.setVersion('1.0.0')
		.setTermsOfService('https://teacoder.ru/docs/agreement')
		.setContact(
			'TeaCoder Support',
			'https://teacoder.ru',
			'support@teacoder.ru'
		)
		.setLicense(
			'AGPLv3',
			'https://github.com/teacoder-team/backend/blob/master/LICENSE'
		)
		.build()
}

function formatSwaggerDocument(document: OpenAPIObject): string {
	const documentString = JSON.stringify(document)
	return documentString.replace(/"allOf":\[{(.*?)}\]/gim, '$1')
}

function saveSwaggerFiles(
	jsonDocument: string,
	originalDocument: OpenAPIObject
): void {
	const outputDirectory = path.resolve(
		process.cwd(),
		'src',
		'static',
		'swagger'
	)
	const jsonFilePath = path.join(outputDirectory, 'openapi.json')
	const yamlFilePath = path.join(outputDirectory, 'openapi.yaml')

	ensureDirectoryExists(outputDirectory)

	fs.writeFileSync(jsonFilePath, jsonDocument, 'utf8')
	fs.writeFileSync(yamlFilePath, YAML.stringify(originalDocument), 'utf8')
}

function ensureDirectoryExists(directoryPath: string): void {
	if (!fs.existsSync(directoryPath)) {
		fs.mkdirSync(directoryPath, { recursive: true })
	}
}
