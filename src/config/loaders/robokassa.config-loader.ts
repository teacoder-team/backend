import { ConfigService } from '@nestjs/config'

import { HashAlgorithm } from '@/libs/robokassa/enums'
import type { RobokassaOptions } from '@/libs/robokassa/interfaces'
import { isDev } from '@/shared/utils'

import type { AllConfigs } from '../definitions'

export function getRobokassaConfig(
	configService: ConfigService<AllConfigs>
): RobokassaOptions {
	return {
		login: configService.get('robokassa.login', { infer: true }),
		password1: configService.get('robokassa.password1', { infer: true }),
		password2: configService.get('robokassa.password2', { infer: true }),
		isTest: isDev(configService),
		algorithm: HashAlgorithm.SHA512
	}
}
