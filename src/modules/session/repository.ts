import { env } from '@/config/env'
import { redis } from '@/infra/redis'

export interface StoredSession {
	id: string
	userId: string
	ip: string
	country: string
	city: string
	browser: string
	os: string
	device: string
	createdAt: string
}

const sessionKey = (sessionId: string) => `session:${sessionId}`
const userIndexKey = (userId: string) => `session:user:${userId}`

export const saveSession = async (session: StoredSession) => {
	await redis
		.multi()
		.set(
			sessionKey(session.id),
			JSON.stringify(session),
			'EX',
			env.SESSION_TTL,
		)
		.sadd(userIndexKey(session.userId), session.id)
		.expire(userIndexKey(session.userId), env.SESSION_TTL)
		.exec()
}

export const findSession = async (
	sessionId: string,
): Promise<StoredSession | null> => {
	const raw = await redis.get(sessionKey(sessionId))

	return raw ? (JSON.parse(raw) as StoredSession) : null
}

export const listSessions = async (
	userId: string,
): Promise<StoredSession[]> => {
	const ids = await redis.smembers(userIndexKey(userId))
	if (!ids.length) return []

	const records = await redis.mget(ids.map(sessionKey))

	const sessions: StoredSession[] = []
	const expired: string[] = []

	records.forEach((raw, index) => {
		if (raw) sessions.push(JSON.parse(raw) as StoredSession)
		else expired.push(ids[index] as string)
	})

	// Session keys expire on their own; the index would keep their ids forever.
	// Session keys expire on their own; the index would keep their ids forever.
	if (expired.length) await redis.srem(userIndexKey(userId), ...expired)

	return sessions
}

export const deleteSession = async (userId: string, sessionId: string) => {
	const result = await redis
		.multi()
		.del(sessionKey(sessionId))
		.srem(userIndexKey(userId), sessionId)
		.exec()

	return Number(result?.[0]?.[1] ?? 0) > 0
}

export const deleteAllSessions = async (userId: string) => {
	const ids = await redis.smembers(userIndexKey(userId))
	if (!ids.length) return 0

	await redis.del(...ids.map(sessionKey), userIndexKey(userId))

	return ids.length
}
