import { ConfigService } from '@nestjs/config'
import type { YookassaOptions } from 'nestjs-yookassa'

import type { AllConfigs } from '../definitions'

export function getYookassaConfig(
	configService: ConfigService<AllConfigs>
): YookassaOptions {
	return {
		shopId: configService.get('yookassa.shopId', {
			infer: true
		}),
		apiKey: configService.get('yookassa.apiKey', { infer: true })
	}
}
