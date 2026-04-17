import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/env'

import type { ProdamusConfig } from '../definitions'
import { ProdamusValidator } from '../validators'

export const prodamusEnv = registerAs<ProdamusConfig>('prodamus', () => {
	validateEnv(process.env, ProdamusValidator)

	return {
		secretKey: process.env.PRODAMUS_SECRET_KEY
	}
})
