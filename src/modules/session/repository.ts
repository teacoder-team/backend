import type { Prisma, Session } from '@prisma/generated/client'

import { db } from '@/infra/db'

/**
 * PostgreSQL is the source of truth for sessions. Nothing in here knows about
 * the cache — see `./cache.ts` for the read path used on every request.
 */

/** A session that has neither been revoked nor reached its expiry. */
const active = (now: Date): Prisma.SessionWhereInput => ({
	revokedAt: null,
	expiresAt: { gt: now },
})

export interface NewSession {
	userId: string
	ip: string
	userAgent: string
	country: string | null
	city: string | null
	browser: string | null
	os: string | null
	device: string | null
	expiresAt: Date
}

export const insertSession = (data: NewSession): Promise<Session> =>
	db.session.create({ data })

export const findActiveSession = (sessionId: string) =>
	db.session.findFirst({ where: { id: sessionId, ...active(new Date()) } })

export const listActiveSessions = (userId: string) =>
	db.session.findMany({
		where: { userId, ...active(new Date()) },
		orderBy: { lastSeenAt: 'desc' },
	})

export const listActiveSessionIds = async (userId: string) => {
	const sessions = await db.session.findMany({
		where: { userId, ...active(new Date()) },
		select: { id: true },
	})

	return sessions.map(({ id }) => id)
}

/** Scoped by `userId` so one user can never revoke another user's session. */
export const revokeSessionById = async (userId: string, sessionId: string) => {
	const { count } = await db.session.updateMany({
		where: { id: sessionId, userId, ...active(new Date()) },
		data: { revokedAt: new Date() },
	})

	return count
}

export const revokeSessionsByUser = async (userId: string) => {
	const { count } = await db.session.updateMany({
		where: { userId, ...active(new Date()) },
		data: { revokedAt: new Date() },
	})

	return count
}

export const touchSession = (sessionId: string, lastSeenAt: Date) =>
	db.session.update({ where: { id: sessionId }, data: { lastSeenAt } })

/** Rows are kept past their expiry for a while so the user can audit history. */
export const deleteSessionsDeadBefore = async (cutoff: Date) => {
	const { count } = await db.session.deleteMany({
		where: {
			OR: [{ expiresAt: { lt: cutoff } }, { revokedAt: { lt: cutoff } }],
		},
	})

	return count
}
