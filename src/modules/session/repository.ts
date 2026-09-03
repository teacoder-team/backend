import type { Prisma, Session } from '@prisma/generated/client'

import { db } from '@/infra/db'

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

export const deleteSessionsDeadBefore = async (cutoff: Date) => {
	const { count } = await db.session.deleteMany({
		where: {
			OR: [{ expiresAt: { lt: cutoff } }, { revokedAt: { lt: cutoff } }],
		},
	})

	return count
}
