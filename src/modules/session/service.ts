import { UAParser } from 'ua-parser-js'

import { randomUUID } from 'node:crypto'

import type { Session } from '@prisma/generated/client'

import { env } from '~/config/env'
import { cache } from '~/lib/cache'
import { lookupLocation } from '~/lib/datasets/geo'
import { BadRequestError, NotFoundError, UnauthorizedError } from '~/lib/errors'
import { extendLogContext, logger } from '~/lib/logger'
import { signAccessToken } from '~/lib/security/jwt'
import { generateRefreshToken, hashRefreshToken } from '~/lib/security/refresh-token'

import { enqueueNewDeviceLogin } from './jobs'
import type { CachedSession, RequestOrigin, SessionContext, TokenPair } from './model'
import {
	addUserVisitor,
	countUserVisitors,
	createRefreshToken,
	deleteRefreshTokenFamily,
	findActiveSession,
	findRefreshTokenByHash,
	insertSession,
	listActiveSessionIds,
	listActiveSessions,
	revokeSessionById,
	revokeSessionsByUser,
	rotateRefreshToken,
	touchSession,
	touchUserVisitor
} from './repository'

const TOUCH_INTERVAL_MS = 5 * 60 * 1000

const friendlyNameFor = (browser: string | null, os: string | null) => {
	if (browser && os) {
		return `${browser}, ${os}`
	}

	return browser ?? os
}

export const createSession = async ({ userId, ip, userAgent, visitorId }: SessionContext) => {
	const { country, city } = await lookupLocation(ip)

	const agent = new UAParser(userAgent).getResult()
	const browser = agent.browser.name ?? null
	const os = agent.os.name ?? null

	const session = await insertSession({
		userId,
		ip,
		userAgent,
		friendlyName: friendlyNameFor(browser, os),
		visitorId: visitorId ?? null,
		country,
		city,
		browser,
		os,
		device: agent.device.model ?? null,
		expiresAt: new Date(Date.now() + env.SESSION_TTL * 1000)
	})

	await writeCachedSession(toCachedSession(session))

	extendLogContext({ event: 'session_created', userId, sessionId: session.id })

	return session
}

const touchInBackground = (session: CachedSession) => {
	if (Date.now() - Date.parse(session.lastSeenAt) < TOUCH_INTERVAL_MS) {
		return
	}

	const lastSeenAt = new Date()

	void touchSession(session.id, lastSeenAt)
		.then(() =>
			writeCachedSession({
				...session,
				lastSeenAt: lastSeenAt.toISOString()
			})
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

	if (session) {
		touchInBackground(session)
	}

	return session
}

const refreshExpiresAt = () => new Date(Date.now() + env.SESSION_TTL * 1000)

const rememberVisitor = async (userId: string, visitorId: string) => {
	const isNew = await addUserVisitor(userId, visitorId)

	if (!isNew) {
		await touchUserVisitor(userId, visitorId)

		return false
	}

	return (await countUserVisitors(userId)) > 1
}

export const issueTokenPair = async (userId: string, origin: RequestOrigin): Promise<TokenPair> => {
	const session = await createSession({ userId, ...origin })

	if (origin.visitorId && (await rememberVisitor(userId, origin.visitorId))) {
		extendLogContext({ newDevice: true })

		await enqueueNewDeviceLogin({ sessionId: session.id })
	}

	const refresh = generateRefreshToken()

	await createRefreshToken({
		sessionId: session.id,
		familyId: randomUUID(),
		tokenHash: refresh.hash,
		expiresAt: refreshExpiresAt()
	})

	const accessToken = await signAccessToken({ sub: userId, sid: session.id })

	return { accessToken, refreshToken: refresh.token }
}

export const refreshTokenPair = async (
	rawToken: string,
	visitorId?: string | null
): Promise<TokenPair> => {
	const existing = await findRefreshTokenByHash(hashRefreshToken(rawToken))

	if (!existing || existing.expiresAt < new Date()) {
		throw new UnauthorizedError('Refresh token expired or invalid')
	}

	const session = await findActiveSession(existing.sessionId)

	if (!session) {
		throw new UnauthorizedError('Session expired or revoked')
	}

	if (existing.usedAt) {
		await revokeSession(session.userId, session.id)
		await deleteRefreshTokenFamily(existing.familyId)

		extendLogContext({ event: 'refresh_token_reuse_detected', sessionId: session.id })

		throw new UnauthorizedError('Refresh token already used')
	}

	if (visitorId && session.visitorId && visitorId !== session.visitorId) {
		logger.warn(
			{
				context: 'session',
				sessionId: session.id,
				userId: session.userId,
				visitorId,
				sessionVisitorId: session.visitorId
			},
			'refresh_visitor_mismatch'
		)
	}

	const refresh = generateRefreshToken()

	await rotateRefreshToken(existing.id, {
		sessionId: existing.sessionId,
		familyId: existing.familyId,
		tokenHash: refresh.hash,
		expiresAt: refreshExpiresAt()
	})

	const accessToken = await signAccessToken({ sub: session.userId, sid: session.id })

	return { accessToken, refreshToken: refresh.token }
}

export const getUserSessions = async (userId: string, currentSessionId: string) => {
	const sessions = await listActiveSessions(userId)

	return sessions.map((session) => ({
		id: session.id,
		ip: session.ip,
		friendlyName: session.friendlyName,
		country: session.country,
		city: session.city,
		current: session.id === currentSessionId,
		lastSeenAt: session.lastSeenAt.toISOString(),
		createdAt: session.createdAt.toISOString()
	}))
}

export const revokeSession = async (userId: string, sessionId: string) => {
	const revoked = await revokeSessionById(userId, sessionId)

	if (!revoked) {
		throw new NotFoundError('Session not found')
	}

	await dropCachedSessions(sessionId)

	extendLogContext({ event: 'session_revoked', sessionId })

	return { revoked }
}

export const revokeOtherSession = async (
	userId: string,
	sessionId: string,
	currentSessionId: string
) => {
	if (sessionId === currentSessionId) {
		throw new BadRequestError('Cannot revoke the current session - sign out instead')
	}

	return await revokeSession(userId, sessionId)
}

export const revokeAllSessions = async (userId: string, exceptSessionId?: string) => {
	const sessionIds = await listActiveSessionIds(userId, exceptSessionId)
	const revoked = await revokeSessionsByUser(userId, exceptSessionId)

	await dropCachedSessions(...sessionIds)

	extendLogContext({
		event: exceptSessionId ? 'other_sessions_revoked' : 'all_sessions_revoked',
		revoked
	})

	return { revoked }
}

const MISS_TTL = 30

const key = (sessionId: string) => `session:${sessionId}`

const toCachedSession = (session: Session): CachedSession => ({
	id: session.id,
	userId: session.userId,
	expiresAt: session.expiresAt.toISOString(),
	lastSeenAt: session.lastSeenAt.toISOString()
})

const ttlFor = ({ expiresAt }: CachedSession) => {
	const remaining = (Date.parse(expiresAt) - Date.now()) / 1000

	return Math.min(env.SESSION_CACHE_TTL, remaining)
}

const readCachedSession = (sessionId: string, load: () => Promise<CachedSession | null>) =>
	cache.readThrough<CachedSession>(key(sessionId), { ttl: ttlFor, missTtl: MISS_TTL }, load)

const writeCachedSession = (session: CachedSession) =>
	cache.write(key(session.id), session, ttlFor(session))

const dropCachedSessions = (...sessionIds: string[]) => cache.drop(...sessionIds.map(key))
