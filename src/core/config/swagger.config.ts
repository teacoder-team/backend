import { ConfigService } from '@nestjs/config'

import { parseBoolean } from '@/shared/utils/parse-boolean.util'

import { SwaggerDto } from '../swagger/dto/swagger.dto'

export function getSwaggerConfig(configService: ConfigService): SwaggerDto {
	return {
		title: 'TeaCoder API',
		description: 'API for Teacoder educational platform',
		version: '1.0.0',
		path: configService.getOrThrow<string>('SWAGGER_PREFIX'),
		enabled: parseBoolean(
			configService.getOrThrow<string>('SWAGGER_ENABLED')
		),
		contact: {
			name: 'TeaCoder Team',
			site: 'https://teacoder.ru',
			email: 'help@teacoder.ru'
		}
	}
}
