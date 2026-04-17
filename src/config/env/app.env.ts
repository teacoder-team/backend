import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/env'

import type { AppConfig } from '../definitions'
import { AppValidator } from '../validators'

export const appEnv = registerAs<AppConfig>('app', () => {
	validateEnv(process.env, AppValidator)

	return {
		nodeEnv: process.env.NODE_ENV,
		port: Number(process.env.HTTP_PORT),
		host: process.env.HTTP_HOST,
		corsOrigin: process.env.HTTP_CORS
	}
})
