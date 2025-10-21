import { registerAs } from '@nestjs/config'

import type { StorageConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { StorageValidator } from '../validators'

export const storageEnv = registerAs<StorageConfig>('storage', () => {
	validateEnv(process.env, StorageValidator)

	return {
		url: process.env.STORAGE_URL,
		apiKey: process.env.STORAGE_API_KEY
	}
})
