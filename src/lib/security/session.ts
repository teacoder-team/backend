import { UAParser } from 'ua-parser-js'
import { redis } from '@/core/redis'
import { getLocation } from '@/core/providers/geo'
import { logger } from '@/core/logger/pino'
import { AppError } from '@/core/errors/base'
import { ErrorCode } from '@/core/errors/codes'

interface SessionContext {
	userId: string
	ip: string
	userAgent: string
}

export async function createSession({ userId, ip, userAgent }: SessionContext) {
	try {
		const sessionId = crypto.randomUUID()

		const geo = getLocation(ip)
		const ua = new UAParser(userAgent).getResult()

		const sessionData = {
			id: sessionId,
			userId,
			ip,
			ua,
			country:
				geo?.country?.names.ru || geo?.country?.names.en || 'Unknown',
			city: geo?.city?.names.ru || geo?.city?.names.en || 'Unknown',
			browser: ua.browser.name,
			os: ua.os.name,
			model: ua.device.model || 'Desktop',
			createdAt: new Date().toISOString(),
		}

		const pipeline = redis.pipeline()
		pipeline.set(
			`auth:sessions:${sessionId}`,
			JSON.stringify(sessionData),
			'EX',
			60 * 60 * 24 * 30,
		)
		pipeline.sadd(`auth:user_sessions:${userId}`, sessionId)
		await pipeline.exec()

		return sessionData
	} catch (err) {
		logger.error(
			{ context: 'security', err, userId },
			'failed_to_create_session',
		)
		throw new AppError(
			ErrorCode.INTERNAL_SERVER_ERROR,
			500,
			'Failed to create session',
		)
	}
}
