import { registerAs } from '@nestjs/config'

import type { ProdamusConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { ProdamusValidator } from '../validators'

export const prodamusEnv = registerAs<ProdamusConfig>('prodamus', () => {
	validateEnv(process.env, ProdamusValidator)

	return {
		secretKey: process.env.PRODAMUS_SECRET_KEY
	}
})
