import { UAParser } from 'ua-parser-js'

import { env } from '@/config/env'
import { lookupLocation } from '@/infra/datasets/geo'
import { extendLogContext, logger } from '@/infra/logger'
import { ErrorCode, NotFoundError } from '@/shared/errors'
import {
	type CachedSession,
	dropCachedSessions,
	readCachedSession,
	toCachedSession,
	writeCachedSession,
} from './cache'
import {
	findActiveSession,
	insertSession,
	listActiveSessionIds,
	listActiveSessions,
	revokeSessionById,
	revokeSessionsByUser,
	touchSession,
} from './repository'

const TOUCH_INTERVAL_MS = 5 * 60 * 1000

export interface SessionContext {
	userId: string
	ip: string
	userAgent: string
}

export const createSession = async ({
	userId,
	ip,
	userAgent,
}: SessionContext) => {
	const { country, city } = await lookupLocation(ip)
	const agent = new UAParser(userAgent).getResult()

	const session = await insertSession({
		userId,
		ip,
		userAgent,
		country,
		city,
		browser: agent.browser.name ?? null,
		os: agent.os.name ?? null,
		device: agent.device.model ?? null,
		expiresAt: new Date(Date.now() + env.SESSION_TTL * 1000),
	})

	await writeCachedSession(toCachedSession(session))

	extendLogContext({ event: 'session_created', userId, sessionId: session.id })

	return session
}

const touchInBackground = (session: CachedSession) => {
	if (Date.now() - Date.parse(session.lastSeenAt) < TOUCH_INTERVAL_MS) return

	const lastSeenAt = new Date()

	void touchSession(session.id, lastSeenAt)
		.then(() =>
			writeCachedSession({
				...session,
				lastSeenAt: lastSeenAt.toISOString(),
			}),
		)
		.catch((err) => {
			logger.warn({ err, sessionId: session.id }, 'session_touch_failed')
		})
}

export const resolveSession = async (sessionId: string) => {
	const session = await readCachedSession(sessionId, async () => {
		const stored = await findActiveSession(sessionId)

		return stored ? toCachedSession(stored) : null
	})

	if (session) touchInBackground(session)

	return session
}

export const getUserSessions = async (
	userId: string,
	currentSessionId: string,
) => {
	const sessions = await listActiveSessions(userId)

	return sessions.map((session) => ({
		id: session.id,
		ip: session.ip,
		country: session.country,
		city: session.city,
		browser: session.browser,
		os: session.os,
		device: session.device,
		current: session.id === currentSessionId,
		lastSeenAt: session.lastSeenAt.toISOString(),
		createdAt: session.createdAt.toISOString(),
	}))
}

export const revokeSession = async (userId: string, sessionId: string) => {
	const revoked = await revokeSessionById(userId, sessionId)

	if (!revoked) {
		throw new NotFoundError(
			'Session not found',
			ErrorCode.SESSION_NOT_FOUND,
		)
	}

	await dropCachedSessions(sessionId)

	extendLogContext({ event: 'session_revoked', sessionId })

	return { revoked }
}

export const revokeAllSessions = async (userId: string) => {
	const sessionIds = await listActiveSessionIds(userId)
	const revoked = await revokeSessionsByUser(userId)

	await dropCachedSessions(...sessionIds)

	extendLogContext({ event: 'all_sessions_revoked', revoked })

	return { revoked }
}
