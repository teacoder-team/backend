import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/env'

import type { StorageConfig } from '../definitions'
import { StorageValidator } from '../validators'

export const storageEnv = registerAs<StorageConfig>('storage', () => {
	validateEnv(process.env, StorageValidator)

	return {
		url: process.env.STORAGE_URL,
		apiKey: process.env.STORAGE_API_KEY
	}
})
