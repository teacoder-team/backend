import { ConfigService } from '@nestjs/config'

import type { HeleketOptions } from '@/shared/interfaces'

import type { AllConfigs } from '../definitions'

export function getHeleketConfig(
	configService: ConfigService<AllConfigs>
): HeleketOptions {
	return {
		merchant: configService.get('heleket.merchantId', { infer: true }),
		apiKey: configService.get('heleket.apiKey', { infer: true })
	}
}
