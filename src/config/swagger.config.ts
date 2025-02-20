import { DocumentBuilder } from '@nestjs/swagger'

export function getSwaggerConfig() {
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
