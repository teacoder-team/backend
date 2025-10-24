import { registerAs } from '@nestjs/config'

import type { RedisConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { RedisValidator } from '../validators'

export const redisEnv = registerAs<RedisConfig>('redis', () => {
	validateEnv(process.env, RedisValidator)

	return {
		username: process.env.REDIS_USER,
		password: process.env.REDIS_PASSWORD,
		host: process.env.REDIS_HOST,
		port: Number(process.env.REDIS_PORT)
	}
})
