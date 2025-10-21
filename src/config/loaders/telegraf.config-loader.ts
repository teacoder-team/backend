import { ConfigService } from '@nestjs/config'
import type { TelegrafModuleOptions } from 'nestjs-telegraf'

import type { AllConfigs } from '../definitions'

export function getTelegrafConfig(
	configService: ConfigService<AllConfigs>
): TelegrafModuleOptions {
	return {
		token: configService.get('telegram.token', { infer: true })
	}
}
