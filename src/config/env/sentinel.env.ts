import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/env'

import type { SentinelConfig } from '../definitions'
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
		},
		discord: {
			clientId: process.env.DISCORD_CLIENT_ID,
			clientSecret: process.env.DISCORD_CLIENT_SECRET
		},
		yandex: {
			clientId: process.env.YANDEX_CLIENT_ID,
			clientSecret: process.env.YANDEX_CLIENT_SECRET
		},
		gitlab: {
			clientId: process.env.GITLAB_CLIENT_ID,
			clientSecret: process.env.GITLAB_CLIENT_SECRET
		}
	}
})
