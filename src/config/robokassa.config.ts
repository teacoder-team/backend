import { ConfigService } from '@nestjs/config'

import { HashAlgorithm } from '@/libs/robokassa/enums'
import type { RobokassaOptions } from '@/libs/robokassa/interfaces'
import { isDev } from '@/shared/utils'

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
