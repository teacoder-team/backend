import { registerAs } from '@nestjs/config'

import type { FingerprintConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { FingerprintValidator } from '../validators'

export const fingerprintEnv = registerAs<FingerprintConfig>(
	'fingerprint',
	() => {
		validateEnv(process.env, FingerprintValidator)

		return {
			apiKey: process.env.FINGERPRINT_API_KEY
		}
	}
)
