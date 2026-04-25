import { UAParser } from 'ua-parser-js'
import { redis } from '@/core/redis'
import { getLocation } from '@/core/providers/geo'

interface CreateSessionOptions {
	userId: string
	ip: string
	userAgent: string
}

export const sessionService = {
	async create({ userId, ip, userAgent }: CreateSessionOptions) {
		const sessionId = crypto.randomUUID()

		const geo = getLocation(ip)
		const ua = new UAParser(userAgent).getResult()

		const sessionData = {
			id: sessionId,
			userId,
			ip,
			geo: {
				country:
					geo?.country?.names.ru ||
					geo?.country?.names.en ||
					'Unknown',
				city: geo?.city?.names.ru || geo?.city?.names.en || 'Unknown',
			},
			device: {
				browser: ua.browser.name,
				os: ua.os.name,
				model: ua.device.model || 'Desktop',
			},
			createdAt: new Date().toISOString(),
		}

		await redis.set(
			`auth:sessions:${sessionId}`,
			JSON.stringify(sessionData),
			'EX',
			60 * 60 * 24 * 30,
		)
		await redis.sadd(`auth:user_sessions:${userId}`, sessionId)

		return sessionData
	},
}
