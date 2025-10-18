import { ConfigService } from '@nestjs/config'

import { isDev } from '@/common/utils'
import { HashAlgorithm } from '@/libs/robokassa/enums'
import type { RobokassaOptions } from '@/libs/robokassa/interfaces'

export function getRobokassaConfig(
	configService: ConfigService
): RobokassaOptions {
	return {
		login: configService.getOrThrow<string>('ROBOKASSA_LOGIN'),
		password1: configService.getOrThrow<string>('ROBOKASSA_PASSWORD1'),
		password2: configService.getOrThrow<string>('ROBOKASSA_PASSWORD2'),
		isTest: isDev(configService),
		algorithm: HashAlgorithm.SHA512
	}
}
