import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/env'

import type { KinescopeConfig } from '../definitions'
import { KinescopeValidator } from '../validators'

export const kinescopeEnv = registerAs<KinescopeConfig>('kinescope', () => {
	validateEnv(process.env, KinescopeValidator)

	return {
		authToken: process.env.KINESCOPE_AUTH_TOKEN,
		projectId: process.env.KINESCOPE_PROJECT_ID
	}
})
