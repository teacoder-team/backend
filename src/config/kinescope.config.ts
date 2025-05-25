import { ConfigService } from '@nestjs/config'

import type { KinescopeOptions } from '@/common/interfaces'

export function getKinescopeConfig(
	configService: ConfigService
): KinescopeOptions {
	return {
		token: configService.getOrThrow<string>('KINESCOPE_AUTH_TOKEN'),
		projectId: configService.getOrThrow<string>('KINESCOPE_PROJECT_ID')
	}
}
