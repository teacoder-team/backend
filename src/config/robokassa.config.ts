import { ConfigService } from '@nestjs/config'

import type { RobokassaOptions } from '@/common/interfaces'

export function getRobokassaConfig(
	configService: ConfigService
): RobokassaOptions {
	return {
		login: configService.getOrThrow<string>('ROBOKASSA_LOGIN'),
		password: configService.getOrThrow<string>('ROBOKASSA_PASSWORD')
	}
}
