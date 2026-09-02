import { Redis } from 'ioredis'

import { env } from '@/config/env'
import { logger } from '@/infra/logger'

export const redis = new Redis(env.REDIS_URL, {
	maxRetriesPerRequest: null,
	reconnectOnError: (err) => err.message.includes('READONLY'),
	/**
	 * Fail fast instead of queueing while disconnected. Redis backs a cache and
	 * short-lived keys here, so a command that cannot run right now must return
	 * an error the caller can fall back from - never hang the request.
	 */
	enableOfflineQueue: false,
	commandTimeout: 2000,
	/** Bootstrap owns the connection, exactly like the database client. */
	lazyConnect: true,
})

redis.on('error', (err) => {
	logger.error({ context: 'redis', err }, 'redis_error')
})

redis.on('reconnecting', () => {
	logger.warn({ context: 'redis' }, 'redis_reconnecting')
})

export const connectRedis = async () => {
	await redis.connect()
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
