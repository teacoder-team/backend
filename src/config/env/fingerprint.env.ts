import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/env'

import type { FingerprintConfig } from '../definitions'
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
