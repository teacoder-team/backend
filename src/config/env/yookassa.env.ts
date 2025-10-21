import { registerAs } from '@nestjs/config'

import type { YookassaConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { YookassaValidator } from '../validators'

export const yookassaEnv = registerAs<YookassaConfig>('yookassa', () => {
	validateEnv(process.env, YookassaValidator)

	return {
		shopId: process.env.YOOKASSA_SHOP_ID,
		apiKey: process.env.YOOKASSA_API_KEY
	}
})
