import { registerAs } from '@nestjs/config'

import type { RobokassaConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { RobokassaValidator } from '../validators'

export const robokassaEnv = registerAs<RobokassaConfig>('robokassa', () => {
	validateEnv(process.env, RobokassaValidator)

	return {
		login: process.env.ROBOKASSA_LOGIN,
		password1: process.env.ROBOKASSA_PASSWORD1,
		password2: process.env.ROBOKASSA_PASSWORD2
	}
})
