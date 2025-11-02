import { ConfigService } from '@nestjs/config'
import type { YookassaModuleOptions } from 'nestjs-yookassa'

import type { AllConfigs } from '../definitions'

export function getYookassaConfig(
	configService: ConfigService<AllConfigs>
): YookassaModuleOptions {
	return {
		shopId: configService.get('yookassa.shopId', {
			infer: true
		}),
		apiKey: configService.get('yookassa.apiKey', { infer: true })
	}
}
