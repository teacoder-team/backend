import { ConfigService } from '@nestjs/config'

import type { KinescopeOptions } from '@/shared/interfaces'

import type { AllConfigs } from '../definitions'

export function getKinescopeConfig(
	configService: ConfigService<AllConfigs>
): KinescopeOptions {
	return {
		token: configService.get('kinescope.authToken', { infer: true }),
		projectId: configService.get('kinescope.projectId', { infer: true })
	}
}
