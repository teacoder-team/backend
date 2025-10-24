import { registerAs } from '@nestjs/config'

import type { KinescopeConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { KinescopeValidator } from '../validators'

export const kinescopeEnv = registerAs<KinescopeConfig>('kinescope', () => {
	validateEnv(process.env, KinescopeValidator)

	return {
		authToken: process.env.KINESCOPE_AUTH_TOKEN,
		projectId: process.env.KINESCOPE_PROJECT_ID
	}
})
