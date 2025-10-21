import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { ConfigService } from '@nestjs/config'

import type { AllConfigs } from '../definitions'

export function getCorsConfig(config: ConfigService<AllConfigs>): CorsOptions {
	return {
		origin: config.get('app.corsOrigin', { infer: true }).split(','),
		methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
	}
}
