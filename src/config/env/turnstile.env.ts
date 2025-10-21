import { registerAs } from '@nestjs/config'

import type { TurnstileConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { TurnstileValidator } from '../validators'

export const turnstileEnv = registerAs<TurnstileConfig>('turnstile', () => {
	validateEnv(process.env, TurnstileValidator)

	return {
		secretKey: process.env.CAPTCHA_SECRET_KEY
	}
})
