import { ConfigService } from '@nestjs/config'

import type { ProdamusOptions } from '@/libs/prodamus/interfaces'

import type { AllConfigs } from '../definitions'

export function getProdamusConfig(
	configService: ConfigService<AllConfigs>
): ProdamusOptions {
	return {
		secretKey: configService.get('prodamus.secretKey', { infer: true })
	}
}
