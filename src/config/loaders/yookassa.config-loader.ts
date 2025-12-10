import { ConfigService } from '@nestjs/config'
import { HttpsProxyAgent } from 'https-proxy-agent'
import type { YookassaModuleOptions } from 'nestjs-yookassa'

import type { AllConfigs } from '../definitions'

export function getYookassaConfig(
	configService: ConfigService<AllConfigs>
): YookassaModuleOptions {
	const proxyUrl =
		process.env.PROXY_HOST && process.env.PROXY_PORT
			? `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`
			: undefined

	return {
		shopId: configService.get('yookassa.shopId', {
			infer: true
		}),
		apiKey: configService.get('yookassa.apiKey', { infer: true }),
		proxyUrl
	}
}
