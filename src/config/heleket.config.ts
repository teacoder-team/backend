import { ConfigService } from '@nestjs/config'

import type { HeleketOptions } from '@/common/interfaces'

export function getHeleketConfig(configService: ConfigService): HeleketOptions {
	return {
		merchant: configService.getOrThrow<string>('HELEKET_MERCHANT_ID'),
		apiKey: configService.getOrThrow<string>('HELEKET_API_KEY')
	}
}
