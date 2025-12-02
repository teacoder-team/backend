import { ConfigService } from '@nestjs/config'
import { HttpsProxyAgent } from 'https-proxy-agent'
import type { YookassaModuleOptions } from 'nestjs-yookassa'

import type { AllConfigs } from '../definitions'

export function getYookassaConfig(
	configService: ConfigService<AllConfigs>
): YookassaModuleOptions {
	const agent = new HttpsProxyAgent(
		`http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`
	)

	return {
		shopId: configService.get('yookassa.shopId', {
			infer: true
		}),
		apiKey: configService.get('yookassa.apiKey', { infer: true }),
		agent
	}
}
