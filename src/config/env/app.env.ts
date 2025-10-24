import { registerAs } from '@nestjs/config'

import type { AppConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
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
