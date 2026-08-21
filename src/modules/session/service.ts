import { randomUUID } from 'node:crypto'

import { UAParser } from 'ua-parser-js'

import { lookupLocation } from '@/infra/datasets/geo'
import { logger } from '@/infra/logger'
import { ErrorCode, NotFoundError } from '@/shared/errors'
import {
	type StoredSession,
	deleteAllSessions,
	deleteSession,
	listSessions,
	saveSession,
} from './repository'

const UNKNOWN = 'Unknown'
const DEFAULT_DEVICE = 'Desktop'

export interface SessionContext {
	userId: string
	ip: string
	userAgent: string
}

export const createSession = async ({
	userId,
	ip,
	userAgent,
}: SessionContext): Promise<StoredSession> => {
	const { country, city } = await lookupLocation(ip)
	const agent = new UAParser(userAgent).getResult()

	const session: StoredSession = {
		id: randomUUID(),
		userId,
		ip,
		country,
		city,
		browser: agent.browser.name ?? UNKNOWN,
		os: agent.os.name ?? UNKNOWN,
		device: agent.device.model ?? DEFAULT_DEVICE,
		createdAt: new Date().toISOString(),
	}

	await saveSession(session)

	logger.info({ userId, sessionId: session.id }, 'session_created')

	return session
}

const toResponse = (session: StoredSession, currentSessionId: string) => ({
	id: session.id,
	ip: session.ip,
	country: session.country,
	city: session.city,
	browser: session.browser,
	os: session.os,
	device: session.device,
	current: session.id === currentSessionId,
	createdAt: session.createdAt,
})

export const getUserSessions = async (
	userId: string,
	currentSessionId: string,
) => {
	const sessions = await listSessions(userId)

	return sessions
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
		.map((session) => toResponse(session, currentSessionId))
}

export const revokeSession = async (userId: string, sessionId: string) => {
	const removed = await deleteSession(userId, sessionId)

	if (!removed) {
		throw new NotFoundError('Session not found', ErrorCode.SESSION_NOT_FOUND)
	}

	logger.info({ userId, sessionId }, 'session_revoked')

	return { revoked: 1 }
}

export const revokeAllSessions = async (userId: string) => {
	const revoked = await deleteAllSessions(userId)

	logger.info({ userId, revoked }, 'all_sessions_revoked')

	return { revoked }
}
