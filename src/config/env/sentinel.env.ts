import { registerAs } from '@nestjs/config'

import type { SentinelConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { SentinelValidator } from '../validators'

export const sentinelEnv = registerAs<SentinelConfig>('sentinel', () => {
	validateEnv(process.env, SentinelValidator)

	return {
		restHost: process.env.HOSTS_REST,
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET
		}
	}
})
