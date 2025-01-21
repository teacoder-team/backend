import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { ConfigService } from '@nestjs/config'

export function getCorsConfig(config: ConfigService): CorsOptions {
	return {
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN').split(','),
		credentials: true,
		methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
		exposedHeaders: ['set-cookie']
	}
}
