import { registerAs } from '@nestjs/config'

import type { HeleketConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { HeleketValidator } from '../validators'

export const heleketEnv = registerAs<HeleketConfig>('heleket', () => {
	validateEnv(process.env, HeleketValidator)

	return {
		merchantId: process.env.HELEKET_MERCHANT_ID,
		apiKey: process.env.HELEKET_API_KEY
	}
})
