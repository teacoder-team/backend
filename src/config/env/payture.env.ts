import { registerAs } from '@nestjs/config'

import type { PaytureConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { PaytureValidator } from '../validators'

export const paytureEnv = registerAs<PaytureConfig>('payture', () => {
	validateEnv(process.env, PaytureValidator)

	return {
		environment: process.env.PAYTURE_ENVIRONMENT,
		key: process.env.PAYTURE_API_KEY
	}
})
