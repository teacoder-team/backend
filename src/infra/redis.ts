import { Redis } from 'ioredis'

import { env } from '@/config/env'
import { logger } from '@/infra/logger'

export const redis = new Redis(env.REDIS_URL, {
	maxRetriesPerRequest: null,
	reconnectOnError: (err) => err.message.includes('READONLY'),
})

redis.on('error', (err) => {
	logger.error({ context: 'redis', err }, 'redis_error')
})

redis.on('reconnecting', () => {
	logger.warn({ context: 'redis' }, 'redis_reconnecting')
})

export const connectRedis = async () => {
	await redis.ping()
	logger.info({ context: 'redis' }, 'redis_connected')
}

export const disconnectRedis = async () => {
	await redis.quit()
}

export const pingRedis = async () => {
	try {
		await redis.ping()
		return true
	} catch {
		return false
	}
}
