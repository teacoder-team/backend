import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/env'

import type { TurnstileConfig } from '../definitions'
import { TurnstileValidator } from '../validators'

export const turnstileEnv = registerAs<TurnstileConfig>('turnstile', () => {
	validateEnv(process.env, TurnstileValidator)

	return {
		secretKey: process.env.CAPTCHA_SECRET_KEY
	}
})
