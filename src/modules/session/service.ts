import { redis } from '@/core/redis'
import { logger } from '@/core/logger/pino'
import { AppError } from '@/core/errors/base'
import { ErrorCode } from '@/core/errors/codes'

export async function getUserSessions(userId: string) {
	try {
		const sessionIds = await redis.smembers(`auth:user_sessions:${userId}`)

		if (!sessionIds.length) return []

		const sessionKeys = sessionIds.map((id) => `auth:sessions:${id}`)
		const rawSessions = await redis.mget(...sessionKeys)

		return rawSessions
			.filter((session): session is string => session !== null)
			.map((session) => JSON.parse(session))
	} catch (err) {
		logger.error({ err, userId }, 'failed_to_fetch_user_sessions')

		throw new AppError(
			ErrorCode.INTERNAL_SERVER_ERROR,
			500,
			'Failed to fetch user sessions',
		)
	}
}
