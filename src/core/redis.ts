import { Redis } from 'ioredis'

import { env } from '@/core/config/env'
import { logger } from '@/core/logger/pino'

const globalForRedis = globalThis as unknown as {
	redis: Redis | undefined
}

const createRedisClient = () => {
	const client = new Redis(env.REDIS_URL, {
		maxRetriesPerRequest: null,
		reconnectOnError: (err) => {
			const targetError = 'READONLY'

			if (err.message.includes(targetError)) {
				return true
			}

			return false
		},
	})

	client.on('connect', () => {
		logger.info({ context: 'redis' }, 'redis_connected')
	})

	client.on('error', (err) => {
		logger.error({ context: 'redis', err }, 'redis_error')
	})

	client.on('reconnecting', () => {
		logger.warn({ context: 'redis' }, 'redis_reconnecting')
	})

	return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (env.NODE_ENV !== 'production') globalForRedis.redis = redis
