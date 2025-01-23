import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import type { ConfigService } from '@nestjs/config'

export function getCorsConfig(config: ConfigService): CorsOptions {
	return {
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN').split(','),
		methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
	}
}
