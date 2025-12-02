import { ConfigService } from '@nestjs/config'

import type { PaytureOptions } from '@/libs/payture/interfaces'

import type { AllConfigs } from '../definitions'

export function getPaytureConfig(
	configService: ConfigService<AllConfigs>
): PaytureOptions {
	return {
		key: configService.get('payture.key', { infer: true }),
		environment: configService.get('payture.environment', { infer: true })
	}
}
